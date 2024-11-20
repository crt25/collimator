# upload the static files to the S3 buckets

module "frontend" {
  source = "./modules/01-upload-static-files"

  bucket_id       = var.frontend_bucket_id
  build_directory = var.frontend_build_directory
}

module "scratchapp" {
  source = "./modules/01-upload-static-files"

  bucket_id       = var.scratchapp_bucket_id
  build_directory = var.scratchapp_build_directory
}
