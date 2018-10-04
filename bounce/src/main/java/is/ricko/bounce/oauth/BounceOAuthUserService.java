package is.ricko.bounce.oauth;

import is.ricko.bounce.data.BounceAdminGateway;
import is.ricko.bounce.model.BounceAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import static is.ricko.bounce.config.BounceProfiles.OAUTH_ENABLED;

@Profile(OAUTH_ENABLED)
@Component
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceOAuthUserService extends DefaultOAuth2UserService {
  private final BounceAdminGateway adminGateway;

  @Override
  public OAuth2User loadUser(final OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    final OAuth2User user = super.loadUser(userRequest);
    if (user == null) return null;
    final String name = user.getName();
    final BounceAdmin admin = adminGateway.findByEmail(name);
    if (admin == null) throw new OAuth2AuthenticationException(new OAuth2Error("unknown-user", "Unknown User", null), "You logged in, but I don't know you");
    return admin.asOAuth2User();
  }
}
