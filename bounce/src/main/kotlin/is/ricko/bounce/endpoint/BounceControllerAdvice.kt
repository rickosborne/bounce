package `is`.ricko.bounce.endpoint

import `is`.ricko.bounce.error.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import javax.servlet.http.HttpServletResponse

@ControllerAdvice
class BounceControllerAdvice {
    @ExceptionHandler(value = [NotFoundException::class])
    fun notFound404(exception: NotFoundException, response: HttpServletResponse) {
        response.sendError(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.reasonPhrase)
    }
}