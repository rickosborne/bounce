package is.ricko.bounce.model;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface AdminRepository extends CrudRepository<BounceAdmin, Integer> {
  Optional<BounceAdmin> findByEmail(final String email);
}
