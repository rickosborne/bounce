// Primary lambda method
resource "aws_lambda_function" "get_link" {
  // dot-path to main js file
  handler       = "${var.app_request_handler}"
  // Exported function in the handler js above
  function_name = "${var.app_request_function}"
  // App source bucket
  s3_bucket     = "${aws_s3_bucket.app_bucket.bucket}"
  // App source zip
  s3_key        = "${local.app_zip}"
  runtime       = "nodejs8.10"
  role          = "${aws_iam_role.lambda_role.arn}"
  environment {
    variables {
      BOUNCE_STORE_TYPE = "dynamo"
    }
  }
}

// Lambdas also have their own permissions *in addition to* other IAM setup.
resource "aws_lambda_permission" "get_link_perm" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.get_link.arn}"
  principal     = "apigateway.amazonaws.com"
  statement_id  = "AllowAPIGatewayInvoke"
  source_arn    = "${aws_api_gateway_deployment.get_handler_deployment.execution_arn}/*/*"
}

// this one is for the interactive tester UI
resource "aws_lambda_permission" "get_link_perm_test" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.get_link.arn}"
  principal     = "apigateway.amazonaws.com"
  statement_id  = "AllowAPIGatewayInvokeTest"
  source_arn    = "${replace(aws_api_gateway_deployment.get_handler_deployment.execution_arn, format("/%s", aws_api_gateway_deployment.get_handler_deployment.stage_name), "/test-invoke-stage")}/*/*"
}

