terraform {
  backend "s3" {
    bucket = var.tfstate_bucket_name
    key    = "deployment"
    region = var.region
  }
}

