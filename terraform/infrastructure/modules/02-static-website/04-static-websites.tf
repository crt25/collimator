# Create a private S3 bucket for the static website that will be served by CloudFront.
# Inspired by https://dev.to/chinmay13/aws-networking-with-terraform-deploying-a-cloudfront-distribution-for-s3-static-website-2jbf

resource "aws_s3_bucket" "this" {
  bucket = var.name

  # delete all objects in the bucket when destroying the bucket
  force_destroy = true

  tags = var.tags
}

# Disallow public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


