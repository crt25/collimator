variable "name" {
  type    = string
  default = "collimator"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "domain_name" {
  type = string
}

variable "sentry_dsn_backend" {
  type    = string
}

variable "open_id_connect_microsoft_client_id" {
  type    = string
  default = "d8336644-c349-4b7f-972c-829aebc41f1b"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "tfstate_bucket_name" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {
    Name        = "collimator"
    Environment = "dev"
  }
}
