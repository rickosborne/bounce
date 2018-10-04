package is.ricko.bounce.data;

import is.ricko.bounce.model.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceLinkGateway {
  private final AgentRepository agentRepository;
  private final HitRepository hitRepository;
  private final LinkRepository linkRepository;
  @Getter(lazy = true, value = AccessLevel.PROTECTED)
  private final List<BounceAgentRule> rules = buildRules();

  private List<BounceAgentRule> buildRules() {
    return new ArrayList<>(agentRepository.findAllByOrderByPriorityAsc());
  }

  public BounceAgent findAgent(final String ua) {
    if (ua == null || ua.isEmpty()) return null;
    for (final BounceAgentRule rule : getRules()) {
      final BounceAgent agent = rule.toAgent(ua);
      if (agent != null) return agent;
    }
    return null;
  }

  public List<BounceLink> findAll() {
    final Iterable<BounceLink> iterable = linkRepository.findAll();
    if (iterable instanceof List) return (List<BounceLink>) iterable;
    final List<BounceLink> all = new LinkedList<>();
    for (final BounceLink link : iterable) {
      all.add(link);
    }
    return all;
  }

  public Optional<BounceLink> findByKey(final String key) {
    return linkRepository.findByName(key);
  }

  @Transactional
  public void hitOrPeek(final boolean isPeek, @NonNull final BounceLink link, final String ip, final String ref, final String ua, final String cookie, final String uaVendor, final Integer uaMajor, final String uaVer, final Boolean mobile, final Boolean bot) {
    if (isPeek) {
      linkRepository.updatePeeksById(link.getId());
    } else {
      final BounceHit hit = new BounceHit();
      hit.setLink(link);
      hit.setIpFromString(ip);
      hit.setReferer(ref);
      hit.setUa(ua);
      hit.setUaMajor(uaMajor);
      hit.setUaVendor(uaVendor);
      hit.setUaVer(uaVer);
      hit.setMobile(mobile);
      hit.setBot(bot);
      hit.setCookie(cookie);
      hit.setDate(new Date());
      hitRepository.save(hit);
      linkRepository.updateHitsById(link.getId());
    }
  }
}
