package `is`.ricko.bounce.data

import `is`.ricko.bounce.config.OAUTH_ENABLED
import `is`.ricko.bounce.model.BounceAdmin
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.sql.ResultSet

@Component
@Profile(OAUTH_ENABLED)
class BounceAdminGateway @Autowired constructor(private val jdbcTemplate: JdbcTemplate) {
    fun findByEmail(email: String): BounceAdmin? {
        val admins: List<BounceAdmin>? = jdbcTemplate.query(FIND_BY_EMAIL, arrayOf(email), ::mapAdmin)
        if (admins == null || admins.size != 1) {
            return null
        }
        return admins[0]
    }

    private fun mapAdmin(rs: ResultSet, rn: Int): BounceAdmin {
        return BounceAdmin(rs.getString("admin_email"), rs.getString("admin_name"))
    }
}

const val FIND_BY_EMAIL = """
    SELECT admin_email, admin_name
    FROM bounce_admin
    WHERE admin_email = ?
    """