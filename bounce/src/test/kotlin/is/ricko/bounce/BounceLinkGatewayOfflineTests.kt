package `is`.ricko.bounce

import `is`.ricko.bounce.data.BounceLinkGateway
import `is`.ricko.bounce.data.SELECT_ALL_UA
import `is`.ricko.bounce.model.BounceAgentRule
import `is`.ricko.bounce.model.MatchExtractor
import org.junit.Test
import org.mockito.Mockito.*
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import java.util.*
import kotlin.test.assertEquals

class BounceLinkGatewayOfflineTests {
    @Test
    fun rulesAreLazyLoaded() {
        val jdbcTemplate = mock(JdbcTemplate::class.java)
        val gateway = BounceLinkGateway(jdbcTemplate)
        verifyZeroInteractions(jdbcTemplate)
        val givenRules: LinkedList<BounceAgentRule> = LinkedList()
        val extractor: MatchExtractor = { _ -> "" }
        val rule = BounceAgentRule(1, Regex("foo"), extractor, extractor, extractor, extractor, extractor)
        givenRules.add(rule)
        `when`(jdbcTemplate.query(eq(SELECT_ALL_UA), any(RowMapper::class.java))).thenReturn(givenRules)
        val rules: LinkedList<BounceAgentRule> = gateway.rules
        assertEquals(givenRules, rules)
    }
}