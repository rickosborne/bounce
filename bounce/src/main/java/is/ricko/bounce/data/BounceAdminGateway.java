package is.ricko.bounce.data;

import is.ricko.bounce.model.AdminRepository;
import is.ricko.bounce.model.BounceAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceAdminGateway {
  private final AdminRepository repository;

  public BounceAdmin findByEmail(final String email) {
    final Optional<BounceAdmin> maybeAdmin = repository.findByEmail(email);
    return maybeAdmin.orElse(null);
  }
}
