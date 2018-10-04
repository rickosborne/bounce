package is.ricko.bounce.oauth;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static is.ricko.bounce.config.BounceProfiles.OAUTH_ENABLED;
import static is.ricko.bounce.oauth.BounceOAuthSecurityConfigurerPlugin.OAUTH_LOGIN_PATH;

@Profile(OAUTH_ENABLED)
@Controller
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceOAuthController {
  public static final String LOGIN_SUCCESS = "/loginSuccess";
  private final OAuth2AuthorizedClientService authorizedClientService;
  private final InMemoryClientRegistrationRepository clientRegistrationRepository;
  @Getter(lazy = true, value = AccessLevel.PROTECTED)
  private final Map<String, String> authenticationUrls = StreamSupport.stream(clientRegistrationRepository
    .spliterator(), false)
    .collect(Collectors.toMap(ClientRegistration::getClientName, cr -> "/oauth/authorization/" + cr.getRegistrationId()));

  @GetMapping(LOGIN_SUCCESS)
  public String getLoginInfo(final Model model, final OAuth2AuthenticationToken authentication) {
    final OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(authentication.getAuthorizedClientRegistrationId(), authentication.getName());
    final String uri = client.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUri();
    if (uri != null && !uri.isEmpty()) {
      final RestTemplate template = new RestTemplate();
      final HttpHeaders headers = new HttpHeaders();
      headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + client.getAccessToken().getTokenValue());
      final HttpEntity<String> httpEntity = new HttpEntity<>("", headers);
      final ResponseEntity<Map> response = template.exchange(uri, HttpMethod.GET, httpEntity, Map.class);
      final Map<?, ?> userAttributes = response.getBody();
      model.addAttribute("name", userAttributes.get("name"));
    }
    return "loginSuccess";
  }

  @GetMapping(OAUTH_LOGIN_PATH)
  public String getOAuthLogin(final Model model) {
    model.addAttribute("urls", getAuthenticationUrls());
    return "oauth_login";
  }
}
