package is.ricko.bounce.oauth;

import is.ricko.bounce.data.BounceAdminGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Optional;

@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceOidcUserService extends OidcUserService {
  private final BounceAdminGateway adminGateway;

  @Override
  public OidcUser loadUser(final OidcUserRequest userRequest) {
    if (userRequest == null) return null;
    final OidcIdToken idToken = userRequest.getIdToken();
    return Optional.ofNullable(loadUser(userRequest))
      .map(OidcUser::getUserInfo)
      .map(OidcUserInfo::getEmail)
      .map(adminGateway::findByEmail)
      .map(admin -> admin.asOidcUser(idToken))
      .orElseThrow(() -> new OAuth2AuthenticationException(new OAuth2Error("unknown-user", "Unknown User", null), "You logged in, but I don't know you"));
  }
}
