package `is`.ricko.bounce.oauth

import `is`.ricko.bounce.config.OAUTH_ENABLED
import `is`.ricko.bounce.data.BounceAdminGateway
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.oidc.user.OidcUser

@Profile(OAUTH_ENABLED)
class BounceOidcUserService(private val adminGateway: BounceAdminGateway) : OidcUserService() {
    override fun loadUser(userRequest: OidcUserRequest?): OidcUser {
        val user = super.loadUser(userRequest)
        val email = user.userInfo.email
        val admin = adminGateway.findByEmail(email)
            ?: throw throw OAuth2AuthenticationException(OAuth2Error("unknown-user", "Unknown User", null), "You logged in, but I don't know you")
        admin.idToken = user.idToken
        return admin
    }
}