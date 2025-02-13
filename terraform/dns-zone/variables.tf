variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "domain_name" {
  type = string
}

variable "tfstate_bucket_name" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {
    Name = "collimator"
  }
}
