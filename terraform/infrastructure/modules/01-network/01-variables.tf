variable "vpc_cidr" {
  type = string
}

variable "name" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "region" {
  type = string
}
