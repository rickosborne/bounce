package is.ricko.bounce.oauth;

import is.ricko.bounce.config.BounceConfig;
import is.ricko.bounce.config.BounceSecurityConfigurerPlugin;
import is.ricko.bounce.data.BounceAdminGateway;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.endpoint.NimbusAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static is.ricko.bounce.config.BounceConfig.GITHUB;
import static is.ricko.bounce.config.BounceConfig.GOOGLE;
import static is.ricko.bounce.config.BounceProfiles.OAUTH_ENABLED;

@Configuration
@Profile(OAUTH_ENABLED)
@Log
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceOAuthSecurityConfigurerPlugin implements BounceSecurityConfigurerPlugin {
  public static final String OAUTH_BASE_URI = "/oauth/authorization";
  public static final String OAUTH_LOGIN_PATH = "/oauth/login";
  public static final String OAUTH_REDIRECT = "/oauth/redirect";
  private static final List<String> clients = Arrays.asList(GOOGLE, GITHUB);
  @Getter(onMethod = @__(@Bean))
  private final NimbusAuthorizationCodeTokenResponseClient accessTokenResponseClient = new NimbusAuthorizationCodeTokenResponseClient();
  private final BounceAdminGateway adminGateway;
  @Getter(onMethod = @__(@Bean))
  private final HttpSessionOAuth2AuthorizationRequestRepository authorizationRequestRepository = new HttpSessionOAuth2AuthorizationRequestRepository();
  private final BounceConfig config;
  @Getter(onMethod = @__(@Bean))
  private final InMemoryClientRegistrationRepository clientRegistrationRepository = new InMemoryClientRegistrationRepository(clients.stream()
    .map(this::getRegistration)
    .filter(Objects::nonNull)
    .collect(Collectors.toList()));
  @Getter(onMethod = @__(@Bean))
  private final InMemoryOAuth2AuthorizedClientService authorizedClientService = new InMemoryOAuth2AuthorizedClientService(clientRegistrationRepository);
  @Getter(lazy = true, value = AccessLevel.PROTECTED)
  private final BounceOAuthUserService oauthUserService = new BounceOAuthUserService(adminGateway);
  @Getter(lazy = true, value = AccessLevel.PROTECTED)
  private final BounceOidcUserService oidcUserService = new BounceOidcUserService(adminGateway);

  @Override
  public void configure(final HttpSecurity http) {
    try {
      http
        .authorizeRequests()
          .antMatchers(OAUTH_LOGIN_PATH).permitAll()
          .antMatchers("/admin/**").authenticated()
          .anyRequest().permitAll()
          .and()
        .exceptionHandling()
          .accessDeniedHandler((request, unused1, unused2) -> {
            final String remoteAddr = request.getRemoteAddr();
            log.severe("Access denied: " + remoteAddr);
          })
          .and()
        .oauth2Login()
          .clientRegistrationRepository(clientRegistrationRepository)
          .authorizedClientService(authorizedClientService)
          .tokenEndpoint().accessTokenResponseClient(accessTokenResponseClient).and()
          .redirectionEndpoint().baseUri(OAUTH_REDIRECT).and()
          .loginPage(OAUTH_LOGIN_PATH)
          .authorizationEndpoint().baseUri(OAUTH_BASE_URI).authorizationRequestRepository(authorizationRequestRepository).and()
          .defaultSuccessUrl("/admin/")
          .userInfoEndpoint()
          .userService(getOauthUserService())
          .oidcUserService(getOidcUserService())
          .and();
    } catch (final Exception e) {
      throw new IllegalStateException("Cannot configure HTTP Security", e);
    }
  }

  private ClientRegistration getRegistration(final String client) {
    final String clientId = config.clientIdFor(client);
    final String clientSecret = config.secretFor(client);
    if (clientId == null || clientSecret == null) return null;
    final CommonOAuth2Provider provider;
    switch (client) {
      case GOOGLE:
        provider = CommonOAuth2Provider.GOOGLE;
        break;
      case GITHUB:
        provider = CommonOAuth2Provider.GITHUB;
        break;
      default:
        return null;
    }
    final String oauth2redirectUri = config.getOauth2redirectUri();
    return provider.getBuilder(client)
      .clientId(clientId)
      .clientSecret(clientSecret)
      .redirectUriTemplate(oauth2redirectUri + "/oauth/redirect")
      .build();
  }
}
