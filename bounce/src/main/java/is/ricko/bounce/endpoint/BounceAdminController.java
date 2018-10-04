package is.ricko.bounce.endpoint;

import is.ricko.bounce.data.BounceLinkGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import static is.ricko.bounce.config.BounceProfiles.OAUTH_ENABLED;

@Controller
@RequestMapping("/admin")
@Profile(OAUTH_ENABLED)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BounceAdminController {
  private final BounceLinkGateway linkGateway;

  @GetMapping
  public String adminHome(final Model model) {
    model.addAttribute("links", linkGateway.findAll());
    return "admin_index";
  }
}
