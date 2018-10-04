package is.ricko.bounce.endpoint;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@RestController
public class BounceErrorController implements ErrorController {
  public static final String ERROR_PATH = "/error";

  @RequestMapping(ERROR_PATH)
  public String error(final HttpServletResponse response) {
    response.setContentType(MediaType.TEXT_PLAIN_VALUE);
    final int statusCode = response.getStatus();
    final HttpStatus status = HttpStatus.resolve(statusCode);
    return status == null ? "Error" : statusCode + " " + status.getReasonPhrase();
  }

  @Override
  public String getErrorPath() {
    return ERROR_PATH;
  }
}
