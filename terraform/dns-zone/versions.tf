﻿terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.75.0"
    }
  }

  backend "s3" {
    bucket = var.tfstate_bucket_name
    key    = "infrastructure/dns-zone"
    region = var.region
  }
}

provider "aws" {
  region = var.region
}
