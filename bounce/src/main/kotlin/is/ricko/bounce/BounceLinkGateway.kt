package `is`.ricko.bounce

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.sql.ResultSet
import java.sql.Types
import java.util.*

@Component
class BounceLinkGateway @Autowired constructor(private val jdbcTemplate: JdbcTemplate) {
    val rules: LinkedList<BounceAgentRule> = LinkedList()
        get() {
            if (field.isEmpty()) {
                val rules: MutableList<BounceAgentRule> = jdbcTemplate.query(SELECT_ALL_UA) { rs, _ ->
                    BounceAgentRule(
                        priority = rs.getInt("ua_priority"),
                        regex = Regex(rs.getString("ua_regex")),
                        vendor = matchOrLiteral(rs.getString("ua_vendor")),
                        major = matchOrLiteral(rs.getString("ua_major")),
                        ver = matchOrLiteral(rs.getString("ua_ver")),
                        mobile = matchOrLiteral(rs.getString("ua_mobile")),
                        bot = matchOrLiteral(rs.getString("ua_bot"))
                    )
                }
                field.addAll(rules)
            }
            return field
        }

    fun findByKey(key: String): BounceLink? {
        val links: List<BounceLink>? = jdbcTemplate.query(SELECT_LINK_BY_NAME, arrayOf(key)) { rs: ResultSet, _: Int ->
            BounceLink(
                id = rs.getInt("link_id"),
                name = rs.getString("link_name"),
                created = rs.getDate("link_created"),
                hits = rs.getInt("link_hits"),
                peeks = rs.getInt("link_peeks"),
                to = rs.getString("link_to"),
                title = rs.getString("link_title")
            )
        }
        if (links == null || links.isEmpty() || links.size > 1) {
            return null
        }
        return links[0]
    }

    fun hitOrPeek(isPeek: Boolean, link: BounceLink, ipv4: Int?, ref: String?, ua: String?, cookie: String?, ua_vendor: String?, ua_major: Int?, ua_ver: String?, mobile: Boolean?, bot: Boolean?) {
        jdbcTemplate.update(INSERT_HIT,
            arrayOf(link.id, ipv4, ref, ua, cookie, ua_vendor, ua_major, ua_ver, if (mobile != null && mobile) 1 else 0, if (bot != null && bot) 1 else 0),
            intArrayOf(Types.INTEGER, orNull(ipv4, Types.INTEGER), orNull(ref, Types.VARCHAR), orNull(ua, Types.VARCHAR), orNull(cookie, Types.VARCHAR), orNull(ua_vendor, Types.VARCHAR), orNull(ua_major, Types.INTEGER), orNull(ua_ver, Types.VARCHAR), Types.BIT, Types.BIT)
        )
        jdbcTemplate.update(if (isPeek) UPDATE_PEEKS_BY_ID else UPDATE_HITS_BY_ID, arrayOf(link.id ?: -1), intArrayOf(Types.INTEGER))
    }

    fun agent(ua: String?): BounceAgent? {
        if (ua == null || ua.isBlank()) {
            return null
        }
        for (rule in rules) {
            val matchResult: MatchResult? = rule.regex.find(ua)
            if (matchResult != null) {
                return BounceAgent(
                    vendor = rule.vendor.invoke(matchResult),
                    major = rule.major.invoke(matchResult)?.toInt(),
                    ver = rule.ver.invoke(matchResult),
                    mobile = rule.mobile.invoke(matchResult)?.isNotBlank(),
                    bot = rule.bot.invoke(matchResult)?.isNotBlank()
                )
            }
        }
        return null
    }
}

fun orNull(value: Any?, type: Int): Int {
    return if (value == null) Types.NULL else type
}

fun matchOrLiteral(s: String?): MatchExtractor {
    return if (s == null || s.isBlank()) {
        _ -> null
    } else if (s.startsWith("-")) {
        mr -> mr.groupValues[Math.abs(s.toInt())]
    } else {
        _ -> s
    }
}

const val SELECT_ALL_UA = """
    SELECT ua_priority, ua_regex, ua_vendor, ua_major, ua_ver, ua_mobile, ua_bot
    FROM bounce_ua
    ORDER BY ua_priority
    """

const val SELECT_LINK_BY_NAME = """
    SELECT link_id, link_name, link_created, link_hits, link_peeks, link_to, link_title
    FROM bounce_link
    WHERE link_name = ?
    """

const val INSERT_HIT = """
    INSERT INTO bounce_hit (hit_dt, hit_link, hit_ip4, hit_ref, hit_ua, hit_cookie, hit_ua_vendor, hit_ua_major, hit_ua_ver, hit_mobile, hit_bot)
    VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

const val UPDATE_PEEKS_BY_ID = """
    UPDATE bounce_link
    SET link_peeks = link_peeks + 1
    WHERE link_id = ?
    """

const val UPDATE_HITS_BY_ID = """
    UPDATE bounce_link
    SET link_hits = link_hits + 1
    WHERE link_id = ?
    """

