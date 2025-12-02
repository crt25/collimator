variable "name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "region" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "frontend_lambda_arn" {
  type = string
}

variable "frontend_bucket" {
  type = string
}

variable "frontend_bucket_arn" {
  type = string
}

variable "frontend_domain_name" {
  type = string
}

variable "scratchapp_lambda_arn" {
  type = string
}

variable "scratchapp_bucket" {
  type = string
}

variable "scratchapp_bucket_arn" {
  type = string
}

variable "scratchapp_domain_name" {
  type = string
}

variable "jupyterapp_bucket" {
  type = string
}

variable "jupyterapp_lambda_arn" {
  type = string
}

variable "jupyterapp_bucket_arn" {
  type = string
}

variable "jupyterapp_domain_name" {
  type = string
}

variable "backend_domain_name" {
  type = string
}
