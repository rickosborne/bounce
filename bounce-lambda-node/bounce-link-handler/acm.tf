// The API gateway needs a TLS cert provisioned by AWS.
// There's some extra offline setup that will need to be done if you don't use Route 53.
// See the related outputs.
resource "aws_acm_certificate" "domain-cert" {
  domain_name = "${var.domain_name}"
  validation_method = "DNS"
}
