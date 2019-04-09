output "base_url" {
  value = "${aws_api_gateway_deployment.get_handler_deployment.invoke_url}"
}

output "cert-record-name" {
  value = "${aws_acm_certificate.domain-cert.domain_validation_options.0.resource_record_name}"
}

output "cert-record-type" {
  value = "${aws_acm_certificate.domain-cert.domain_validation_options.0.resource_record_type}"
}

output "cert-record-value" {
  value = "${aws_acm_certificate.domain-cert.domain_validation_options.0.resource_record_value}"
}
