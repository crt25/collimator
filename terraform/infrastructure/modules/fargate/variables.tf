variable "name" {
  type = string
}

variable "environment" {
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

variable "private_dns_arn" {
  type = string
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "private_subnet_objects" {
  type = list(object({
    availability_zone = string
    cidr_block        = string
  }))
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "discovery_service_arn" {
  type = string
}

variable "open_id_connect_microsoft_client_id" {
  type = string
}

variable "sentry_dsn" {
  type = string
}