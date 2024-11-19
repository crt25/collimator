variable "name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnets_cidr_blocks" {
  type = any
}

variable "database_subnet_group_name" {
  type = string
}
