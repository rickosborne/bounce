package `is`.ricko.bounce.config

import org.slf4j.Logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Component

@Component
class BounceAppListener : ApplicationListener<ApplicationReadyEvent> {
    @Logging
    private var logger: Logger? = null

    override fun onApplicationEvent(event: ApplicationReadyEvent) {
        logger?.info("Boot complete. Signalling GC.")
        System.gc()
    }
}