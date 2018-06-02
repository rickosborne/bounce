package `is`.ricko.bounce

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.endpoint.NimbusAuthorizationCodeTokenResponseClient
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository

@Configuration
class BounceSecurityConfig @Autowired constructor(
    private val config: BounceConfig,
    adminGateway: BounceAdminGateway
) : WebSecurityConfigurerAdapter() {
    private val clients: List<String> = listOf(GOOGLE, GITHUB)
    // So this private-backing-field thing looks dumb, but ...
    private val _clientRegistrationRepository = InMemoryClientRegistrationRepository(clients
        .map { c -> getRegistration(c) }
        .filter { r -> r != null }
    )
    private val _authorizedClientService = InMemoryOAuth2AuthorizedClientService(_clientRegistrationRepository)
    private val _authorizationRequestRepository = HttpSessionOAuth2AuthorizationRequestRepository()
    private val _accessTokenResponseClient = NimbusAuthorizationCodeTokenResponseClient()
    private val _oauthUserService = BounceOAuthUserService(adminGateway)
    private val _oidcUserService = BounceOidcUserService(adminGateway)

    // Because of the way Kotlin auto-converts field access into getters you get Spring errors:
    // BeanFactory has not been injected into @Configuration class
    // So the beans are defined with the getters while the private fields do not have @Bean and don't get intercepted by Spring.
    @Suppress("unused")
    val clientRegistrationRepository @Bean get() = _clientRegistrationRepository
    @Suppress("unused")
    val authorizedClientService @Bean get() = _authorizedClientService
    @Suppress("unused")
    val authorizationRequestRepository @Bean get() = _authorizationRequestRepository
    @Suppress("unused")
    val accessTokenResponseClient @Bean get() = _accessTokenResponseClient

    private fun getRegistration(client: String): ClientRegistration? {
        val clientId: String? = config.oauth2clientId[client]
        val clientSecret: String? = config.oauth2clientSecret[client]
        if (clientId == null || clientSecret == null) return null
        val provider = when (client) {
            GOOGLE -> CommonOAuth2Provider.GOOGLE
            GITHUB -> CommonOAuth2Provider.GITHUB
            else -> null
        } ?: return null
        return provider.getBuilder(client)
            .clientId(clientId)
            .clientSecret(clientSecret)
            .redirectUriTemplate("${config.oauth2redirectUri}/oauth/redirect")
            .build()
    }

    override fun configure(http: HttpSecurity?) {
        @Suppress("IfThenToSafeAccess")
        if (http != null) {
            @Suppress("UseExpressionBody")
            http.authorizeRequests()
                    .antMatchers(OAUTH_LOGIN_PATH).permitAll()
                    .antMatchers("/admin/**").authenticated()
                    .anyRequest().permitAll()
                    .and()
                .oauth2Login()
                    .clientRegistrationRepository(_clientRegistrationRepository)
                    .authorizedClientService(_authorizedClientService)
                    .tokenEndpoint().accessTokenResponseClient(_accessTokenResponseClient).and()
                    .redirectionEndpoint().baseUri(OAUTH_REDIRECT).and()
                    .loginPage(OAUTH_LOGIN_PATH)
                    .authorizationEndpoint().baseUri(OAUTH_BASE_URI).authorizationRequestRepository(_authorizationRequestRepository).and()
                    .defaultSuccessUrl("/admin/")
                    .userInfoEndpoint()
                        .userService(_oauthUserService)
                        .oidcUserService(_oidcUserService)
                        .and()
                    .and()
        }
    }
}

const val OAUTH_LOGIN_PATH = "/oauth/login"
const val OAUTH_BASE_URI = "/oauth/authorization"
const val OAUTH_REDIRECT = "/oauth/redirect"