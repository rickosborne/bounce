package `is`.ricko.bounce

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.net.Inet4Address
import java.net.InetAddress
import java.net.UnknownHostException
import java.nio.ByteBuffer
import java.util.*
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@RestController
class BounceController @Autowired constructor(
    private val bounceLinkGateway: BounceLinkGateway,
    private val config: BounceConfig
) {
    @RequestMapping(path = ["/{key:^(?!oauth|admin).*$}", "/"], method = [RequestMethod.GET, RequestMethod.HEAD])
    fun bounceGet(
        @PathVariable(value = "key", required = false) key: String?,
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        val link: BounceLink = requireLink(key)
        val ua: String? = request.getHeader("User-Agent")
        val agent: BounceAgent? = bounceLinkGateway.agent(ua)
        val isPeek: Boolean = HttpMethod.HEAD.matches(request.method)
        val cookie: String? = getCookie(request)
        bounceLinkGateway.hitOrPeek(
            isPeek = isPeek,
            link = link,
            ipv4 = ipv4FromAddr(request.remoteAddr),
            ref = chop(request.getHeader("Referer"), 255),
            ua = chop(ua, 255),
            cookie = chop(cookie, 32),
            ua_vendor = agent?.vendor,
            ua_major = agent?.major,
            ua_ver = agent?.ver,
            mobile = agent?.mobile,
            bot = agent?.bot
        )
        if (isPeek) {
            response.status = HttpStatus.NO_CONTENT.value()
            response.addHeader("Location", link.to)
            response.addHeader("Title", link.title)
            if (link.hits != null) response.addHeader("Hits", link.hits.toString())
            if (link.peeks != null) response.addHeader("Peeks", link.peeks.toString())
        } else {
            response.addCookie(buildCookie(cookie))
            response.sendRedirect(link.to)
        }
    }

    private fun requireLink(key: String?): BounceLink {
        return bounceLinkGateway.findByKey(key ?: "") ?: throw NotFoundException("No such link")
    }

    private fun buildCookie(value: String?): Cookie {
        val sessionId: String = if (value == null || value.isBlank()) {
            val uuid: UUID = UUID.randomUUID()
            val bytes: ByteArray = ByteBuffer.wrap(ByteArray(16))
                .putLong(uuid.mostSignificantBits)
                .putLong(uuid.leastSignificantBits)
                .array()
            Base64.getUrlEncoder().encodeToString(bytes)
        } else {
            value
        }
        val outCookie = Cookie(config.cookieName, sessionId)
        outCookie.comment = config.cookieComment
        outCookie.domain = config.domain
        outCookie.maxAge = config.cookieMaxAge
        outCookie.isHttpOnly = true
        return outCookie
    }

    private fun getCookie(request: HttpServletRequest): String? {
        val cookieName = config.cookieName
        val cookies: Array<out Cookie>? = request.cookies
        if (cookies == null || cookies.isEmpty()) return null
        for (cookie in cookies) {
            if (cookieName == cookie.name) {
                return cookie.value
            }
        }
        return null
    }
}

fun ipv4FromAddr(addr: String): Int? {
    return try {
        val inetAddress: InetAddress = Inet4Address.getByName(addr)
        ByteBuffer.wrap(inetAddress.address).int
    } catch (ex: UnknownHostException) {
        null
    }
}

fun chop(s: String?, c: Int): String? {
    return if (s == null || s.isBlank()) null else if (s.length <= c) s else s.substring(0, c)
}
