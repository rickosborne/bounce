package is.ricko.bounce;

import lombok.Getter;
import lombok.extern.java.Log;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.UnsupportedEncodingException;
import java.util.Enumeration;

@RunWith(SpringRunner.class)
@SpringBootTest
@Log
public abstract class ABounceOnlineTests extends ABounceOfflineTests {
  public static final String LINE = "------------------------------------------------------------------------\n";

  @Autowired
  @Getter
  private WebApplicationContext context;

  protected MockMvc getMockMvc() {
    return MockMvcBuilders.webAppContextSetup(context)
      .alwaysDo(this::logRequestResponse)
      .build();
  }

  protected void logRequestResponse(final MvcResult result) {
    if (result == null) return;
    final MockHttpServletRequest request = result.getRequest();
    final StringBuilder msg = new StringBuilder().append("\n").append(LINE);
    final String method = request.getMethod();
    msg.append(method).append(" ").append(request.getRequestURI());
    final String queryString = request.getQueryString();
    if (queryString != null) msg.append("?").append(queryString);
    msg.append("\n");
    final Enumeration<String> headerNames = request.getHeaderNames();
    while (headerNames.hasMoreElements()) {
      final String headerName = headerNames.nextElement();
      msg.append(headerName).append(": ").append(request.getHeader(headerName)).append("\n");
    }
    try {
      final int contentLength = request.getContentLength();
      if (contentLength > 0) {
        msg.append("\n");
        final String requestBody = request.getContentAsString();
        if (requestBody != null && !requestBody.isEmpty()) msg.append(requestBody).append("\n");
      }
    } catch (final UnsupportedEncodingException e) {
      log.severe("((Could not serialize request body)) " + e.getMessage());
    }
    msg.append("\n");
    final MockHttpServletResponse response = result.getResponse();
    msg.append("HTTP/1.0 ").append(response.getStatus()).append(" ").append(HttpStatus.valueOf(response.getStatus()).getReasonPhrase()).append("\n");
    for (final String headerName : response.getHeaderNames()) {
      msg.append(headerName).append(": ").append(response.getHeader(headerName)).append("\n");
    }
    try {
      final int contentLength = response.getContentLength();
      if (contentLength > 0) {
        msg.append("\n").append(response.getContentAsString()).append("\n");
      }
    } catch (UnsupportedEncodingException e) {
      log.severe("((Could not serialize response body)) " + e.getMessage());
    }
    log.info(msg.append(LINE).toString());
  }
}
