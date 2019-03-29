variable "app_version" {}

provider "aws" {
  region = "us-east-1"
  version = ">= 1.58.0"
}

resource "aws_s3_bucket" "app_bucket" {
  bucket = "is-ricko-bounce"
  acl = "private"
}

resource "aws_iam_role" "handler_role" {
  name = "handle_bounce_request_role"
  assume_role_policy = <<ASSUME_ROLE_POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
ASSUME_ROLE_POLICY
}

resource "aws_lambda_function" "handler_lambda" {
  function_name = "handleBounceRequest"
  s3_bucket = "${aws_s3_bucket.app_bucket.bucket}"
  s3_key = "handleBounceRequest-${var.app_version}.zip"
  handler = "index.handleBounceRequest"
  runtime = "nodejs6.10"
  role = "${aws_iam_role.handler_role.arn}"
}

resource "aws_api_gateway_rest_api" "handler_gateway" {
  name = "handleBounceRequestGateway"
  description = "Gateway for Bounce Request"
}

resource "aws_api_gateway_resource" "proxy" {
  parent_id = "${aws_api_gateway_rest_api.handler_gateway.root_resource_id}"
  path_part = "{proxy+}"
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
}

resource "aws_api_gateway_method" "proxy" {
  authorization = "NONE"
  http_method = "GET"
  resource_id = "${aws_api_gateway_resource.proxy.id}"
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
}

resource "aws_api_gateway_integration" "lambda" {
  http_method = "${aws_api_gateway_method.proxy.http_method}"
  resource_id = "${aws_api_gateway_method.proxy.resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
  type = "AWS_PROXY"
  integration_http_method = "POST"
  uri = "${aws_lambda_function.handler_lambda.invoke_arn}"
}

resource "aws_api_gateway_method" "proxy_root" {
  authorization = "NONE"
  http_method = "GET"
  resource_id = "${aws_api_gateway_rest_api.handler_gateway.root_resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
}

resource "aws_api_gateway_integration" "lambda_root" {
  http_method = "${aws_api_gateway_method.proxy_root.http_method}"
  resource_id = "${aws_api_gateway_method.proxy_root.resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
  type = "AWS_PROXY"
  integration_http_method = "POST"
  uri = "${aws_lambda_function.handler_lambda.invoke_arn}"
}

resource "aws_api_gateway_deployment" "bounce_handler_deployment" {
  rest_api_id = "${aws_api_gateway_rest_api.handler_gateway.id}"
  stage_name = "test"
  depends_on = [
    "aws_api_gateway_integration.lambda",
    "aws_api_gateway_integration.lambda_root",
  ]
}

resource "aws_lambda_permission" "gateway_perm" {
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.handler_lambda.arn}"
  principal = "apigateway.amazonaws.com"
  statement_id = "AllowAPIGatewayInvoke"
  source_arn = "${aws_api_gateway_deployment.bounce_handler_deployment.execution_arn}/*/*"
}

output "base_url" {
  value = "${aws_api_gateway_deployment.bounce_handler_deployment.invoke_url}"
}

resource "aws_docdb_cluster" "bounce_docdb" {
  cluster_identifier = "is-ricko-bounce-docdb"
  engine = "docdb"
  master_username = "is-ricko-bounce-docdb-master-username"
  master_password = "is-ricko-bounce-docdb-master-password"
}
