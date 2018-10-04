package is.ricko.bounce.model;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LinkRepository extends CrudRepository<BounceLink, Integer> {
  Optional<BounceLink> findByName(final String name);

  @Query(
    "UPDATE link " +
    "SET peeks = peeks + 1 " +
    "WHERE (id = :id) "
  )
  @Modifying
  void updatePeeksById(@Param("id") final int id);

  @Query(
    "UPDATE link " +
    "SET hits = hits + 1 " +
    "WHERE (id = :id) "
  )
  @Modifying
  void updateHitsById(@Param("id") final int id);
}
