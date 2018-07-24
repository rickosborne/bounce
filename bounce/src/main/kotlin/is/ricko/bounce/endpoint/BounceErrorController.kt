package `is`.ricko.bounce.endpoint

import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletResponse

@RestController
class BounceErrorController : ErrorController {
    override fun getErrorPath() = ERROR_PATH

    @RequestMapping(ERROR_PATH)
    fun error(response: HttpServletResponse): String? {
        response.contentType = MediaType.TEXT_PLAIN_VALUE
        val statusCode = response.status
        val status = HttpStatus.resolve(statusCode)
        return if (status == null) "Error" else "$statusCode ${status.reasonPhrase}"
    }
}

const val ERROR_PATH = "/error"
