package is.ricko.bounce;

import is.ricko.bounce.data.BounceLinkGateway;
import is.ricko.bounce.model.*;
import lombok.val;
import org.junit.Test;

import java.util.LinkedList;

import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;

public class BounceLinkGatewayOfflineTests {
  @Test
  public void rulesAreLazyLoaded() {
    final AgentRepository agentRepository = mock(AgentRepository.class);
    final LinkRepository linkRepository = mock(LinkRepository.class);
    final HitRepository hitRepository = mock(HitRepository.class);
    val gateway = new BounceLinkGateway(agentRepository, hitRepository, linkRepository);
    verifyZeroInteractions(agentRepository, linkRepository, hitRepository);
    val givenRules = new LinkedList<BounceAgentRule>();
    val rule = new BounceAgentRule(null, null, null, 1, "foo", null, null);
    givenRules.add(rule);
    doReturn(givenRules).when(agentRepository).findAllByOrderByPriorityAsc();
    final BounceAgent agent = gateway.findAgent("foo");
    assertNotNull(agent);
  }
}
