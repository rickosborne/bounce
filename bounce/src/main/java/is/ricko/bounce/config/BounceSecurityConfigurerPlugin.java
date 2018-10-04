package is.ricko.bounce.config;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

public interface BounceSecurityConfigurerPlugin {
  void configure(final HttpSecurity httpSecurity);
}
