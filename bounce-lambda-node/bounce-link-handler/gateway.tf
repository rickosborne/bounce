// Top-level gateway
resource "aws_api_gateway_rest_api" "gateway" {
  name        = "handleBounceRequestGateway"
  description = "Gateway for Bounce Request"
  // We don't need edge caching
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "proxy" {
  parent_id   = "${aws_api_gateway_rest_api.gateway.root_resource_id}"
  // this becomes the path parameter in the request
  path_part   = "{linkId+}"
  rest_api_id = "${aws_api_gateway_rest_api.gateway.id}"
}

// This is the one used for requests *with* a path
resource "aws_api_gateway_method" "get_link" {
  authorization = "NONE"
  http_method   = "GET"
  resource_id   = "${aws_api_gateway_resource.proxy.id}"
  rest_api_id   = "${aws_api_gateway_rest_api.gateway.id}"
}

// This is the one used for requests *without* a path
resource "aws_api_gateway_method" "get_root" {
  authorization = "NONE"
  http_method   = "GET"
  resource_id   = "${aws_api_gateway_rest_api.gateway.root_resource_id}"
  rest_api_id   = "${aws_api_gateway_rest_api.gateway.id}"
}

// Defines how the gateway calls the lambda *with* a path
resource "aws_api_gateway_integration" "get_link" {
  http_method             = "${aws_api_gateway_method.get_link.http_method}"
  resource_id             = "${aws_api_gateway_method.get_link.resource_id}"
  rest_api_id             = "${aws_api_gateway_rest_api.gateway.id}"
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = "${aws_lambda_function.get_link.invoke_arn}"
}

// Defines how the gateway calls the lambda *without* a path
resource "aws_api_gateway_integration" "get_root" {
  http_method             = "${aws_api_gateway_method.get_root.http_method}"
  resource_id             = "${aws_api_gateway_method.get_root.resource_id}"
  rest_api_id             = "${aws_api_gateway_rest_api.gateway.id}"
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = "${aws_lambda_function.get_link.invoke_arn}"
}

resource "aws_api_gateway_deployment" "get_handler_deployment" {
  rest_api_id = "${aws_api_gateway_rest_api.gateway.id}"
  // You can have multiple stages with different permissions.
  stage_name  = "test"

  depends_on = [
    "aws_api_gateway_integration.get_link",
    "aws_api_gateway_integration.get_root",
  ]
}

// Allow requests with a custom domain name
resource "aws_api_gateway_domain_name" "ricko-is-gateway" {
  domain_name = "${var.domain_name}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  regional_certificate_arn = "${aws_acm_certificate.domain-cert.arn}"
}

// Different paths on the domain can map to different handlers ...
// But we just use the default / path
resource "aws_api_gateway_base_path_mapping" "ricko-is-gateway-path" {
  api_id = "${aws_api_gateway_rest_api.gateway.id}"
  stage_name = "${aws_api_gateway_deployment.get_handler_deployment.stage_name}"
  domain_name = "${var.domain_name}"

  depends_on = [
    "aws_api_gateway_domain_name.ricko-is-gateway"
  ]
}
