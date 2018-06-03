package `is`.ricko.bounce.model

data class BounceAgentRule (
    val priority: Int,
    val regex: Regex,
    val vendor: MatchExtractor,
    val major: MatchExtractor,
    val ver: MatchExtractor,
    val mobile: MatchExtractor,
    val bot: MatchExtractor
)

typealias MatchExtractor = (matchResult: MatchResult) -> String?