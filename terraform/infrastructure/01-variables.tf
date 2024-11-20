
variable "name" {
  type    = string
  default = "collimator"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "domain_name" {
  type    = string
  default = "collimator.tyratox.ch"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "tags" {
  type = map(string)
  default = {
    Name = "collimator"
  }
}
