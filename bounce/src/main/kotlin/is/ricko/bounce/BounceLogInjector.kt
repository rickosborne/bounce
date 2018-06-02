package `is`.ricko.bounce

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.stereotype.Component
import org.springframework.util.ReflectionUtils
import java.lang.reflect.Field

@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FIELD)
annotation class Logging

@Component
class BounceLogInjector : BeanPostProcessor {
    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any? {
        return bean
    }

    override fun postProcessBeforeInitialization(bean: Any, beanName: String): Any? {
        val javaClass = bean.javaClass
        ReflectionUtils.doWithFields(javaClass) { field: Field ->
            ReflectionUtils.makeAccessible(field)
            if (field.getAnnotation(Logging::class.java) != null) {
                val logger = LoggerFactory.getLogger(javaClass)
                field.set(bean, logger)
            }
        }
        return bean
    }
}