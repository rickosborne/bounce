package `is`.ricko.bounce

import java.util.*

data class BounceLink (
    val id: Int? = null,
    val name: String,
    val created: Date? = null,
    val hits: Int? = null,
    val peeks: Int? = null,
    val to: String,
    val title: String? = null
)
