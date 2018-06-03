package `is`.ricko.bounce.model

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.OidcUserInfo
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.core.user.OAuth2User

data class BounceAdmin(
    private val email: String,
    private val name: String
) : UserDetails, OAuth2User, OidcUser {
    private var idToken: OidcIdToken? = null
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> = mutableListOf()
    override fun isEnabled() = true
    override fun getUsername() = email
    override fun isCredentialsNonExpired() = true
    override fun getPassword() = null
    override fun isAccountNonExpired() = true
    override fun isAccountNonLocked() = true
    override fun getName() = name
    override fun getEmail() = email
    override fun getAttributes(): MutableMap<String, Any> = mutableMapOf("email" to email, "name" to name)
    override fun getIdToken() = idToken

    fun setIdToken(token: OidcIdToken?) {
        idToken = token
    }

    override fun getClaims(): MutableMap<String, Any> = mutableMapOf()

    override fun getUserInfo(): OidcUserInfo = OidcUserInfo(mutableMapOf())
}