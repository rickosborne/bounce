package is.ricko.bounce.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceSecurityConfig extends WebSecurityConfigurerAdapter {
  private final Optional<List<BounceSecurityConfigurerPlugin>> securityConfigurerPlugins;

  @Override
  protected void configure(final HttpSecurity http) {
    if (http != null && securityConfigurerPlugins != null && securityConfigurerPlugins.isPresent()) {
      for (final BounceSecurityConfigurerPlugin plugin : securityConfigurerPlugins.orElseGet(Collections::emptyList)) {
        plugin.configure(http);
      }
    }
  }
}
