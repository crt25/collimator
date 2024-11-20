terraform {
  backend "s3" {
    bucket = var.tfstate_bucket_name
    key    = "github-actions-deployment/${var.environment}"
    region = var.region
  }
}

provider "aws" {
  region = var.region
}
