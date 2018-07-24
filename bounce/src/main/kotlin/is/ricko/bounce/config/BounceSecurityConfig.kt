package `is`.ricko.bounce.config

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter

@Configuration
class BounceSecurityConfig @Autowired(required = false) constructor(
    private val securityConfigurerPlugins: List<BounceSecurityConfigurerPlugin>?
) : WebSecurityConfigurerAdapter() {

    override fun configure(http: HttpSecurity?) {
        if (http != null && securityConfigurerPlugins != null) {
            for (plugin in securityConfigurerPlugins) {
                plugin.configure(http)
            }
        }
    }
}
