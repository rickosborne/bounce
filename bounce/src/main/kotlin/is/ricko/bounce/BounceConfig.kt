package `is`.ricko.bounce

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class BounceConfig {
    var cookieComment: String = "Correlate multiple ricko.is links - never shared"
        @Value("\${is.ricko.bounce.cookie.comment:Correlate multiple ricko.is links - never shared}") set

    var cookieName: String = "bounce"
        @Value("\${is.ricko.bounce.cookie.name:bounce}") set

    var domain: String = "ricko.is"
        @Value("\${is.ricko.bounce.domain:ricko.is}") set

    var cookieMaxAge: Int = 2147483647

    var jdbcUrl: String? = null
        @Value("\${is.ricko.bounce.jdbc.url}") set

    var jdbcUsername: String? = null
        @Value("\${is.ricko.bounce.jdbc.username}") set

    var jdbcPassword: String? = null
        @Value("\${is.ricko.bounce.jdbc.password}") set

    val oauth2clientId: MutableMap<String, String> = HashMap()

    val oauth2clientSecret: MutableMap<String, String> = HashMap()

    var oauth2redirectUri: String = "{baseUrl}"

    @Value("\${is.ricko.bounce.cookie.maxAge:2147483647}")
    fun setMaxAgeFromString(maybeMaxAge: String?) {
        if (maybeMaxAge != null) {
            cookieMaxAge = maybeMaxAge.toInt()
        }
    }

    @Value("\${is.ricko.bounce.oauth.google.clientId:}")
    fun setGoogleClientId(clientId: String?) {
        setIfNotNull(oauth2clientId, GOOGLE, clientId)
    }

    @Value("\${is.ricko.bounce.oauth.github.clientId:}")
    fun setGitHubClientId(clientId: String?) {
        setIfNotNull(oauth2clientId, GITHUB, clientId)
    }

    @Value("\${is.ricko.bounce.oauth.google.clientSecret:}")
    fun setGoogleClientSecret(secret: String?) {
        setIfNotNull(oauth2clientSecret, GOOGLE, secret)
    }

    @Value("\${is.ricko.bounce.oauth.github.clientSecret:}")
    fun setGitHubClientSecret(secret: String?) {
        setIfNotNull(oauth2clientId, GITHUB, secret)
    }

    @Value("\${is.ricko.bounce.oauth.redirect:}")
    fun setOAuthRedirect(redirectUri: String?) {
        if (redirectUri != null && !redirectUri.isBlank()) {
            oauth2redirectUri = redirectUri
        }
    }

    private fun setIfNotNull(map: MutableMap<String, String>, client: String, value: String?) {
        if (value != null && !value.isBlank()) {
            map[client] = value
        }
    }
}

const val GOOGLE = "google"

const val GITHUB = "github"