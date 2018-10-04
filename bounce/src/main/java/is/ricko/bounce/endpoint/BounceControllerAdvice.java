package is.ricko.bounce.endpoint;

import is.ricko.bounce.error.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@ControllerAdvice
public class BounceControllerAdvice {
  @ExceptionHandler(value = NotFoundException.class)
  public void notFound404(final NotFoundException ignored, final HttpServletResponse response) throws IOException {
    response.sendError(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase());
  }
}
