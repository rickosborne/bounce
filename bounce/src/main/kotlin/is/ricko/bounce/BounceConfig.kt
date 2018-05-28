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

    @Value("\${is.ricko.bounce.cookie.maxAge:2147483647}")
    fun setMaxAgeFromString(maybeMaxAge: String?) {
        if (maybeMaxAge != null) {
            cookieMaxAge = maybeMaxAge.toInt()
        }
    }
}