package is.ricko.bounce.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;

@Configuration
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceRequestLoggingConfig {
  private final BounceConfig bounceConfig;

  @Bean
  public RequestLogger buildRequestLogger() {
    return new RequestLogger(bounceConfig);
  }

  @Value
  private static class Error {
    private final Long id;
    private final String message;
    private final int status;
    private final String type;
  }

  @Value
  @Builder
  private static class Request {
    private final String cookie;
    private final Map<String, String> headers;
    private final Long id;
    private final String ip;
    private final String method;
    private final String path;
    private final String query;
  }

  @RequiredArgsConstructor
  @Log
  private static class RequestLogger extends OncePerRequestFilter {
    private final String cookieName;
    private final boolean logHeaders;
    private final ObjectMapper mapper = new ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    private final AtomicLong nextRequestId = new AtomicLong(0);

    public RequestLogger(final BounceConfig bounceConfig) {
      logHeaders = bounceConfig.isLogHeaders();
      cookieName = bounceConfig.getCookieName();
    }

    @Override
    protected void doFilterInternal(final HttpServletRequest request, final HttpServletResponse response, final FilterChain filterChain) throws ServletException, IOException {
      final long requestId = nextRequestId.incrementAndGet();
      final long startNs = System.nanoTime();
      Thread.currentThread().setName("req-" + requestId);
      final Request req = Request.builder()
        .id(requestId)
        .ip(getRemoteAddr(request))
        .method(request.getMethod())
        .headers(logHeaders ? mapFromEnum(request.getHeaderNames(), request::getHeader) : null)
        .path(request.getRequestURI())
        .query(request.getQueryString())
        .cookie(getCookie(request))
        .build();
      log.info(mapper.writeValueAsString(req));
      try {
        filterChain.doFilter(request, response);
        final Response resp = new Response(requestId, (System.nanoTime() - startNs) / 1_000_000L, response.getStatus());
        log.info(mapper.writeValueAsString(resp));
      } catch (final Throwable ex){
        final Error err = new Error(
          requestId,
          ex.getMessage(),
          response.getStatus(),
          ex.getClass().getSimpleName()
        );
        log.severe(mapper.writeValueAsString(err));
        throw ex;
      }
    }

    private String getCookie(final HttpServletRequest request) {
      final Cookie[] cookies = request.getCookies();
      if (cookies != null) {
        for (final Cookie cookie : cookies) {
          if (cookie != null && Objects.equals(cookie.getName(), cookieName)) {
            return cookie.getValue();
          }
        }
      }
      return null;
    }

    private String getRemoteAddr(final HttpServletRequest request) {
      final String forwardedFor = request.getHeader("X-Forwarded-For");
      if (forwardedFor != null) return forwardedFor;
      return request.getRemoteAddr();
    }

    public <T, U> Map<T, U> mapFromEnum(final Enumeration<T> enumeration, final Function<T, U> block) {
      final HashMap<T, U> map = new HashMap<>();
      while (enumeration.hasMoreElements()) {
        final T element = enumeration.nextElement();
        final U value = block.apply(element);
        if (element != null && value != null) map.put(element, value);
      }
      return map;
    }
  }

  @Value
  private static class Response {
    private final Long id;
    private final Long ms;
    private final int status;
  }
}
