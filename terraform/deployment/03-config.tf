terraform {
  backend "s3" {
    bucket = var.bucket
    key    = "deployment"
    region = var.region
  }
}

