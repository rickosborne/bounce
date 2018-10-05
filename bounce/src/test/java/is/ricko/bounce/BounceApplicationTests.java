package is.ricko.bounce;

import is.ricko.bounce.config.BounceConfig;
import org.junit.Test;

import static is.ricko.bounce.util.BounceUtil.buildCookie;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class BounceApplicationTests extends ABounceOnlineTests {
  @Test
  public void defaultRouteGoesHome() throws Exception {
    getMockMvc()
      .perform(get("/"))
      .andExpect(status().is3xxRedirection())
      .andExpect(header().string("Location", "https://rickosborne.org/"))
      .andExpect(cookie().httpOnly(BounceConfig.COOKIE_NAME_DEFAULT, true))
      .andExpect(cookie().domain(BounceConfig.COOKIE_NAME_DEFAULT, BounceConfig.DOMAIN_DEFAULT))
    ;
  }

  @Test
  public void unknownLinkIsNotFound() throws Exception {
    getMockMvc()
      .perform(get("/" + randomString()))
      .andExpect(status().isNotFound())
      .andExpect(header().doesNotExist("Location"))
      .andExpect(cookie().doesNotExist(BounceConfig.COOKIE_NAME_DEFAULT))
    ;
  }

  @Test
  public void cookiesArePreserved() throws Exception {
    final String cookieValue = randomString();
    getMockMvc()
      .perform(get("/").cookie(buildCookie(BounceConfig.COOKIE_NAME_DEFAULT, cookieValue)))
      .andExpect(status().is3xxRedirection())
      .andExpect(cookie().value(BounceConfig.COOKIE_NAME_DEFAULT, cookieValue))
      .andExpect(cookie().httpOnly(BounceConfig.COOKIE_NAME_DEFAULT, true))
      .andExpect(cookie().domain(BounceConfig.COOKIE_NAME_DEFAULT, BounceConfig.DOMAIN_DEFAULT))
    ;
  }
}
