package `is`.ricko.bounce.config

import `is`.ricko.bounce.config.BounceConfig
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BounceDataSourceConfig @Autowired constructor(private val config: BounceConfig) {
    @Bean
    fun dataSource(): HikariDataSource {
        val hikariConfig = HikariConfig()
        hikariConfig.jdbcUrl = config.jdbcUrl
        hikariConfig.username = config.jdbcUsername
        hikariConfig.password = config.jdbcPassword
        return HikariDataSource(hikariConfig)
    }
}