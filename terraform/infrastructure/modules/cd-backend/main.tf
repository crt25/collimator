resource "aws_s3_bucket" "terraform_state" {
  bucket = var.name

  # block delete unless the bucket is empty
  force_destroy = false

  tags = var.tags
}


# Disallow public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# enable versioning for the S3 bucket
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}
