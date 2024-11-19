variable "name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "region" {
  type = string
}

variable "private_dns_arn" {
  type = string
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "private_subnet_ids" {
  type = any
}

variable "private_subnet_objects" {
  type = any
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = any
}

variable "discovery_service_arn" {
  type = string
}
