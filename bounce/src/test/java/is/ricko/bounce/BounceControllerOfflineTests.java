package is.ricko.bounce;

import is.ricko.bounce.config.BounceConfig;
import is.ricko.bounce.data.BounceLinkGateway;
import is.ricko.bounce.endpoint.BounceController;
import is.ricko.bounce.model.BounceLink;
import lombok.val;
import org.junit.Test;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.util.Date;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class BounceControllerOfflineTests extends ABounceOfflineTests {
  @Test
  public void redirectOnGet() throws IOException {
    val gateway = mock(BounceLinkGateway.class);
    val config = new BounceConfig();
    val request = mock(HttpServletRequest.class);
    val response = mock(HttpServletResponse.class);
    val controller = new BounceController(config, gateway);
    val key = randomString();
    val link = randomLink();
    doReturn(Optional.of(link)).when(gateway).findByKey(eq(key));
    doReturn("GET").when(request).getMethod();
    doReturn(null).when(gateway).findAgent(anyString());
    doReturn(new Cookie[]{}).when(request).getCookies();
    val ipv4 = Inet4Address.getLocalHost().getHostAddress();
    val ipv6 = Inet6Address.getLocalHost().getHostAddress();
    val ip = ipv4 == null ? ipv6 : ipv4;
    when(request.getRemoteAddr()).thenReturn(ip);
    controller.onGet(key, request, response);
    verify(gateway, times(1)).hitOrPeek(eq(false), eq(link), eq(ip), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null));
    verify(response, times(1)).addCookie(any());
    verify(response, times(1)).sendRedirect(eq(link.getTo()));
  }

  private BounceLink randomLink() {
    return new BounceLink(new Date(), randomInt(), randomInt(), randomString(), randomInt(), randomString(), randomString());
  }
}
