package `is`.ricko.bounce

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/admin")
class BounceAdminController constructor(private val gateway: BounceLinkGateway) {

    @GetMapping
    fun adminHome(model: Model): String {
        model.addAttribute("links", gateway.findAll())
        return "admin_index"
    }
}