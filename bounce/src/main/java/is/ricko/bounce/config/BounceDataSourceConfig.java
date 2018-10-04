package is.ricko.bounce.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceDataSourceConfig {
  private final BounceConfig bounceConfig;

  @Bean
  public HikariDataSource dataSource() {
    final HikariConfig hikariConfig = new HikariConfig();
    hikariConfig.setJdbcUrl(bounceConfig.getJdbcUrl());
    hikariConfig.setUsername(bounceConfig.getJdbcUsername());
    hikariConfig.setPassword(bounceConfig.getJdbcPassword());
    return new HikariDataSource(hikariConfig);
  }
}
