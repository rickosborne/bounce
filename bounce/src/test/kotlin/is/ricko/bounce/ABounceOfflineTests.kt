package `is`.ricko.bounce

import org.mockito.Mockito
import java.util.*

abstract class ABounceOfflineTests {
    fun randomString(): String {
        return UUID.randomUUID().toString()
    }

    fun randomInt(): Int {
        return Math.random().toInt()
    }

    fun <T> nonNull(t: T): T {
        Mockito.eq(t)
        return t
    }

    fun <T> anyNull(): T {
        Mockito.any<T>()
        return uninitialized()
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T> uninitialized(): T = null as T
}