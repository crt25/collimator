# upload the static files to the S3 buckets

module "frontend" {
  source = "./modules/s3-upload-directory"

  bucket_id = var.frontend_bucket_id
  directory = var.frontend_build_directory
}

module "scratchapp" {
  source = "./modules/s3-upload-directory"

  bucket_id = var.scratchapp_bucket_id
  directory = var.scratchapp_build_directory
}

module "jupyterapp" {
  source = "./modules/s3-upload-directory"

  bucket_id = var.jupyterapp_bucket_id
  directory = var.jupyterapp_build_directory
}
