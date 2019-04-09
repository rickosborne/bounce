// Allow the AWS gateway
data "aws_iam_policy_document" "gateway-role-policy" {
  statement {
    actions = ["sts:AssumeRole"],
    principals {
      identifiers = ["apigateway.amazonaws.com"]
      type = "Service"
    }
    effect = "Allow",
    sid = ""
  }
}

// Allow Lambda
data "aws_iam_policy_document" "lambda-role-policy" {
  statement {
    actions = ["sts:AssumeRole"],
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type = "Service"
    }
    effect = "Allow",
    sid = ""
  }
}

// Lambda will be allowed to access Dynamo tables
data "aws_iam_policy_document" "dynamo-role-policy" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Query"
    ],
    resources = [
      "${aws_dynamodb_table.link_table.arn}",
      "${aws_dynamodb_table.user_table.arn}"
    ],
    effect = "Allow",
    sid = "DynamoDBExecutions"
  }
}

// API Gateway will be allowed to invoke lambdas
data "aws_iam_policy_document" "gateway-lambda-policy" {
  statement {
    actions = ["lambda:InvokeFunction"],
    resources = [
      "${aws_lambda_function.get_link.arn}"
    ]
    effect = "Allow"
  }
}

// The rest of these just tie everything together
resource "aws_iam_role" "gateway_role" {
  name = "gateway_role"
  assume_role_policy = "${data.aws_iam_policy_document.gateway-role-policy.json}"
}

resource "aws_iam_role" "lambda_role" {
  name = "handle_bounce_request_role"
  assume_role_policy = "${data.aws_iam_policy_document.lambda-role-policy.json}"
}

resource "aws_iam_role_policy" "dynamo_role" {
  name = "dynamo_role_policy"
  role = "${aws_iam_role.lambda_role.id}"
  policy = "${data.aws_iam_policy_document.dynamo-role-policy.json}"
}

resource "aws_iam_role_policy" "gateway-lambda-role-policy" {
  name = "gateway_lambda_role_policy"
  policy = "${data.aws_iam_policy_document.gateway-lambda-policy.json}"
  role = "${aws_iam_role.gateway_role.id}"
}
