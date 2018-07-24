package `is`.ricko.bounce.endpoint

import `is`.ricko.bounce.config.OAUTH_ENABLED
import `is`.ricko.bounce.data.BounceLinkGateway
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/admin")
@Profile(OAUTH_ENABLED)
class BounceAdminController constructor(private val gateway: BounceLinkGateway) {

    @GetMapping
    fun adminHome(model: Model): String {
        model.addAttribute("links", gateway.findAll())
        return "admin_index"
    }
}