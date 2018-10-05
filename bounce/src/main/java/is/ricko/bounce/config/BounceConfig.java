package is.ricko.bounce.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Getter
public class BounceConfig {
  public static final String COOKIE_NAME_DEFAULT = "bounce";
  public static final String DOMAIN_DEFAULT = "ricko.is";
  public static final String GITHUB = "github";
  public static final String GOOGLE = "google";

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.cookie.comment:Correlate multiple ricko.is links - never shared}")))
  private String cookieComment = "Correlate multiple ricko.is links - never shared";

  private int cookieMaxAge = 2147483647;

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.cookie.name:" + COOKIE_NAME_DEFAULT + "}")))
  private String cookieName = COOKIE_NAME_DEFAULT;

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.domain:" + DOMAIN_DEFAULT + "}")))
  private String domain = DOMAIN_DEFAULT;

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.jdbc.password}")))
  private String jdbcPassword = null;

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.jdbc.url}")))
  private String jdbcUrl = null;

  @Setter(onMethod = @__(@Value("${is.ricko.bounce.jdbc.username}")))
  private String jdbcUsername = null;

  private boolean logHeaders = false;

  private final Map<String, String> oauth2clientId = new HashMap<>();

  private final Map<String, String> oauth2clientSecret = new HashMap<>();

  private String oauth2redirectUri = "{baseUrl}";

  public String getRedirectUri() {
    return oauth2redirectUri;
  }

  @Value("${is.ricko.bounce.oauth.github.clientId:}")
  public void setGitHubClientId(final String clientId) {
    setIfNotNull(oauth2clientId, GITHUB, clientId);
  }

  @Value("${is.ricko.bounce.oauth.github.clientSecret:}")
  public void setGitHubClientSecret(final String secret) {
    setIfNotNull(oauth2clientId, GITHUB, secret);
  }

  @Value("${is.ricko.bounce.oauth.google.clientId:}")
  public void setGoogleClientId(final String clientId) {
    setIfNotNull(oauth2clientId, GOOGLE, clientId);
  }

  @Value("${is.ricko.bounce.oauth.google.clientSecret:}")
  public void setGoogleClientSecret(final String secret) {
    setIfNotNull(oauth2clientSecret, GOOGLE, secret);
  }

  public String clientIdFor(final String client) {
    return oauth2clientId.get(client);
  }

  public String secretFor(final String client) {
    return oauth2clientSecret.get(client);
  }

  private void setIfNotNull(final Map<String, String> map, final String key, final String value) {
    if (value != null && !value.isEmpty()) {
      map.put(key, value);
    }
  }

  @Value("${is.ricko.bounce.log.headers:}")
  public void setLogHeaders(final String logHeaders) {
    if (logHeaders != null && !logHeaders.isEmpty()) {
      this.logHeaders = Boolean.valueOf(logHeaders);
    }
  }

  @Value("${is.ricko.bounce.cookie.maxAge:2147483647}")
  public void setMaxAgeFromString(final String maybeMaxAge) {
    if (maybeMaxAge != null) {
      cookieMaxAge = Integer.valueOf(maybeMaxAge, 10);
    }
  }

  @Value("${is.ricko.bounce.oauth.redirect:}")
  public void setOAuthRedirect(final String redirectUri) {
    if (redirectUri != null && !redirectUri.isEmpty()) {
      oauth2redirectUri = redirectUri;
    }
  }
}
