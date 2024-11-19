

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "domain_name" {
  type    = string
  default = "collimator.tyratox.ch"
}

variable "tags" {
  type = map(string)
  default = {
    Name = "collimator"
  }
}
