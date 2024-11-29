variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "tfstate_bucket_name" {
  type = string
}

variable "organization_name" {
  type = string
}

variable "repo_name" {
  type = string
}

variable "ecr_repository_arns" {
  type = list(string)
}

variable "ecs_service_arns" {
  type = list(string)
}

variable "s3_bucket_arns" {
  type = list(string)
}

variable "tags" {
  type = map(string)
  default = {
    Name        = "collimator"
    Environment = "dev"
  }
}
