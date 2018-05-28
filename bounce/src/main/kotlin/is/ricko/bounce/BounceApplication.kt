package `is`.ricko.bounce

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BounceApplication

fun main(args: Array<String>) {
    runApplication<BounceApplication>(*args)
}
