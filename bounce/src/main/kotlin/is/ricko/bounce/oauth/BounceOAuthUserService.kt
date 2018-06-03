package `is`.ricko.bounce.oauth

import `is`.ricko.bounce.data.BounceAdminGateway
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.user.OAuth2User

class BounceOAuthUserService constructor(private val adminGateway: BounceAdminGateway) : DefaultOAuth2UserService() {
    override fun loadUser(userRequest: OAuth2UserRequest?): OAuth2User {
        val user = super.loadUser(userRequest)
        val name = user.name
        return adminGateway.findByEmail(name) ?: throw OAuth2AuthenticationException(OAuth2Error("unknown-user", "Unknown User", null), "You logged in, but I don't know you")
    }
}