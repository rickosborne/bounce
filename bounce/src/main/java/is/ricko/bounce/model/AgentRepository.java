package is.ricko.bounce.model;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AgentRepository extends CrudRepository<BounceAgentRule, Integer> {
  @Cacheable(cacheNames = {"findAll:agent"})
  List<BounceAgentRule> findAllByOrderByPriorityAsc();
}
