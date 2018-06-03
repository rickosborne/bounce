package `is`.ricko.bounce.oauth

import `is`.ricko.bounce.config.OAUTH_LOGIN_PATH
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.client.RestTemplate

@Controller
class BounceOAuthController @Autowired constructor(
    private val authorizedClientService: OAuth2AuthorizedClientService,
    clientRegistrationRepository: InMemoryClientRegistrationRepository
) {
    private val authenticationUrls: Map<String, String> = clientRegistrationRepository
        .associateBy({cr -> cr.clientName}, {cr -> "/oauth/authorization/${cr.registrationId}"})

    @GetMapping(LOGIN_SUCCESS)
    fun getLoginInfo(model: Model, authentication: OAuth2AuthenticationToken): String {
        val client = authorizedClientService.loadAuthorizedClient<OAuth2AuthorizedClient>(authentication.authorizedClientRegistrationId, authentication.name)
        val uri = client.clientRegistration.providerDetails.userInfoEndpoint.uri
        if (uri != null && !uri.isBlank()) {
            val template = RestTemplate()
            val headers = HttpHeaders()
            headers[HttpHeaders.AUTHORIZATION] = "Bearer " + client.accessToken.tokenValue
            val httpEntity = HttpEntity("", headers)
            val response = template.exchange(uri, HttpMethod.GET, httpEntity, Map::class.java)
            val userAttributes = response.body
            model.addAttribute("name", userAttributes!!["name"])
        }
        return "loginSuccess"
    }

    @GetMapping(OAUTH_LOGIN_PATH)
    fun getOAuthLogin(model: Model): String {
        model.addAttribute("urls", authenticationUrls)
        return "oauth_login"
    }


}

const val LOGIN_SUCCESS = "/loginSuccess"