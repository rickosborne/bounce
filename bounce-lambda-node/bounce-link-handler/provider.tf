provider "aws" {
  region                  = "us-east-1"
  profile                 = "bounce-serverless"
  shared_credentials_file = "~/.aws/credentials"
  version                 = ">= 1.58.0"
}
