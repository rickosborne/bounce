variable "app_version" {
  type = "string"
}

variable "domain_name" {
  type = "string"
}

variable "app_request_handler" {
  type = "string"
  default = "bounce-link-handler.handleBounceRequest"
}

variable "app_request_function" {
  type = "string"
  default = "handleBounceRequest"
}

variable "docdb_cluster" {
  type = "string"
}

variable "docdb_username" {
  type = "string"
}

variable "docdb_password" {
  type = "string"
}

