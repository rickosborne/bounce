package `is`.ricko.bounce.config

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.Logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.atomic.AtomicLong
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Configuration
class BounceRequestLoggingConfig @Autowired constructor (config: BounceConfig) {
    private val logFilter = RequestLogger(config)

    @Bean
    fun requestLoggingFilter() = logFilter
}

class RequestLogger(config: BounceConfig) : OncePerRequestFilter() {
    @Logging
    private var log: Logger? = null
    private var nextRequestId = AtomicLong(0)
    private var mapper = ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_EMPTY)
    private var logHeaders = config.logHeaders
    private var cookieName = config.cookieName

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val requestId = nextRequestId.incrementAndGet()
        val startNs = System.nanoTime()
        Thread.currentThread().name = "req-$requestId"
        val req = Request(
            id = requestId,
            ip = getRemoteAddr(request),
            method = request.method,
            headers = if (logHeaders) request.headerNames.toList().associateBy({ k -> k }, { k -> request.getHeader(k) }) else null,
            path = request.requestURI,
            query = request.queryString,
            cookie = getCookie(request)
        )
        log?.info(mapper.writeValueAsString(req))
        try {
            filterChain.doFilter(request, response)
            val resp = Response(
                id = requestId,
                status = response.status,
                ms = (System.nanoTime() - startNs) / 1_000_000L
            )
            log?.info(mapper.writeValueAsString(resp))
        } catch (ex: Throwable) {
            val err = Error(
                id = requestId,
                status = response.status,
                type = ex.javaClass.simpleName,
                message = ex.message
            )
            log?.error(mapper.writeValueAsString(err))
            throw ex
        }
    }

    private fun getRemoteAddr(request: HttpServletRequest): String {
        val forwardedFor = request.getHeader("X-Forwarded-For")
        if (forwardedFor != null) return forwardedFor
        return request.remoteAddr
    }

    private fun getCookie(request: HttpServletRequest): String? {
        for (cookie in request.cookies) {
            if (cookie.name == cookieName) {
                return cookie.value
            }
        }
        return null
    }
}

data class Request(
    val id: Long,
    val ip: String,
    val method: String,
    val path: String,
    val query: String?,
    val cookie: String?,
    val headers: Map<String, String>?
)

data class Response(
    val id: Long,
    val status: Int,
    val ms: Long
)

data class Error(
    val id: Long,
    val status: Int,
    val type: String?,
    val message: String?
)