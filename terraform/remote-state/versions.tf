terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.75.0"
    }
  }

  backend "s3" {
    bucket = var.name
    key    = "bootstrap"
    region = var.region
  }
}

provider "aws" {
  region = var.region
}
