package `is`.ricko.bounce

import `is`.ricko.bounce.config.BounceConfig
import `is`.ricko.bounce.data.BounceLinkGateway
import `is`.ricko.bounce.endpoint.BounceController
import `is`.ricko.bounce.model.BounceLink
import org.junit.Test
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.*
import java.net.Inet4Address
import java.util.*
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class BounceControllerOfflineTests : ABounceOfflineTests() {
    @Test
    fun redirectOnGet() {
        val gateway = mock(BounceLinkGateway::class.java)
        val config = BounceConfig()
        val request = mock(HttpServletRequest::class.java)
        val response = mock(HttpServletResponse::class.java)
        val controller = BounceController(gateway, config)
        val key = randomString()
        val link = randomLink()
        doReturn(link).`when`(gateway).findByKey(nonNull(key))
        doReturn("GET").`when`(request).method
        doReturn(null).`when`(gateway).agent(anyString())
        doReturn(arrayOf<Cookie>()).`when`(request).cookies
        val ipv4: String = Inet4Address.getLocalHost().hostAddress
        `when`(request.remoteAddr).thenReturn(ipv4)
        controller.bounceGet(key, request, response)
        verify(gateway, times(1)).hitOrPeek(nonNull(false), nonNull(link), nonNull(ipv4), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null), eq(null))
        verify(response, times(1)).addCookie(any<Cookie>())
        verify(response, times(1)).sendRedirect(eq(link.to))
    }

    private fun randomLink(): BounceLink {
        return BounceLink(randomInt(), randomString(), Date(), randomInt(), randomInt(), randomString(), randomString())
    }
}