package `is`.ricko.bounce.config

import org.springframework.security.config.annotation.web.builders.HttpSecurity

/**
 * Allows for optional {@link HttpSecurity} configuration.
 */
interface BounceSecurityConfigurerPlugin {
    fun configure(http: HttpSecurity)
}