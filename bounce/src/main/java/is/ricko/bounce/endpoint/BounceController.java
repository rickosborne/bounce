package is.ricko.bounce.endpoint;

import is.ricko.bounce.config.BounceConfig;
import is.ricko.bounce.data.BounceLinkGateway;
import is.ricko.bounce.error.NotFoundException;
import is.ricko.bounce.model.BounceAgent;
import is.ricko.bounce.model.BounceLink;
import is.ricko.bounce.util.BounceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static is.ricko.bounce.util.BounceUtil.chop;

@Controller
public class BounceController {
  private final String cookieComment;
  private final String cookieDomain;
  private final int cookieMaxAge;
  private final String cookieName;
  private final BounceLinkGateway gateway;

  @Autowired
  public BounceController(final BounceConfig config, final BounceLinkGateway gateway) {
    this.cookieName = config.getCookieName();
    this.cookieDomain = config.getDomain();
    this.cookieComment = config.getCookieComment();
    this.cookieMaxAge = config.getCookieMaxAge();
    this.gateway = gateway;
  }

  @RequestMapping(path = {"/{key:^(?!oauth|admin).*$}", "/"}, method = {RequestMethod.GET, RequestMethod.HEAD})
  public void onGet(
    @PathVariable(value = "key", required = false) final String key,
    final HttpServletRequest request,
    final HttpServletResponse response
  ) throws IOException {
    final BounceLink link = requireLink(key);
    final String ua = request.getHeader("User-Agent");
    final BounceAgent agent = gateway.findAgent(ua);
    final boolean isPeek = HttpMethod.HEAD.matches(request.getMethod());
    final String cookie = BounceUtil.getCookie(request, cookieName);
    final String remoteAddr = request.getRemoteAddr();
    gateway.hitOrPeek(isPeek, link, remoteAddr,
      chop(request.getHeader("Referer"), 255),
      chop(ua, 255),
      chop(cookie, 32),
      agent == null ? null : agent.getVendor(),
      agent == null ? null : agent.getMajor(),
      agent == null ? null : agent.getVer(),
      agent == null ? null : agent.getMobile(),
      agent == null ? null : agent.getBot()
    );
    if (isPeek) {
      response.setStatus(HttpStatus.NO_CONTENT.value());
      response.addHeader("Location", link.getTitle());
      response.addHeader("Title", link.getTitle());
      if (link.getHits() != null) response.addHeader("Hits", link.getHits().toString());
      if (link.getPeeks() != null) response.addHeader("Peeks", link.getPeeks().toString());
    } else {
      response.addCookie(BounceUtil.buildCookie(cookieName, cookie, cookieComment, cookieDomain, cookieMaxAge));
      response.sendRedirect(link.getTo());
    }
  }

  private BounceLink requireLink(final String key) {
    return gateway.findByKey(key == null ? "" : key).orElseThrow(() -> new NotFoundException("No such link"));
  }
}
