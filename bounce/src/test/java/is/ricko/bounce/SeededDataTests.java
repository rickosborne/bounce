package is.ricko.bounce;

import is.ricko.bounce.data.BounceLinkGateway;
import is.ricko.bounce.model.BounceAgent;
import is.ricko.bounce.model.BounceLink;
import is.ricko.bounce.model.LinkRepository;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

public class SeededDataTests extends ABounceOnlineTests {
  @Autowired
  private LinkRepository linkRepository;

  @Autowired
  private BounceLinkGateway linkGateway;

  @Test
  public void defaultLinkIsSeeded() {
    final BounceLink defaultLink = linkRepository.findByName("").orElse(null);
    assertNotNull("default link", defaultLink);
    assertEquals("https://rickosborne.org/", defaultLink.getTo());
    assertEquals("", defaultLink.getName());
    assertEquals("rick osborne dot org", defaultLink.getTitle());
  }

  @Test
  public void chromeUserAgentIsSeeded() {
    final BounceAgent agent = linkGateway.findAgent(" Chrome/12.34");
    assertNotNull("Chrome agent", agent);
    assertEquals("Chrome", agent.getVendor());
    assertFalse(agent.getBot());
    assertFalse(agent.getMobile());
    assertEquals((Integer) 12, agent.getMajor());
    assertEquals("12.34", agent.getVer());
  }
}
