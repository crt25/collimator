terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.75.0"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "aws" {
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
  # https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html#acm-regions
  region = "us-east-1"
  alias  = "cloudfront_region_provider"
}
