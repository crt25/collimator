# Create a private S3 bucket for the static website that will be served by CloudFront.
# Inspired by https://dev.to/chinmay13/aws-networking-with-terraform-deploying-a-cloudfront-distribution-for-s3-static-website-2jbf


locals {
  # create a map from file extension to mime type
  mime_types = {
    # HTML files
    "txt"  = "text/plain"
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "cjs"  = "application/javascript"
    "json" = "application/json"

    # source maps
    "map" = "application/json"

    # images
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "jpeg" = "image/jpeg"
    "gif"  = "image/gif"
    "svg"  = "image/svg+xml"
    "ico"  = "image/x-icon"

    # audio files
    "mp3" = "audio/mpeg"
    "wav" = "audio/wav"
    "ogg" = "audio/ogg"

    # fonts
    "ttf" = "font/ttf"
    "otf" = "font/otf"
  }
}

resource "aws_s3_bucket" "scratchapp" {
  bucket = "${module.globals.name}-prod-apps-scratch"

  # delete all objects in the bucket when destroying the bucket
  force_destroy = true

  tags = module.globals.tags
}

# Enable static website hosting for the S3 bucket
resource "aws_s3_bucket_website_configuration" "scratchapp" {
  bucket = aws_s3_bucket.scratchapp.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Disallow public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "scratchapp" {
  bucket                  = aws_s3_bucket.scratchapp.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# upload the scratch app to the S3 bucket
resource "aws_s3_object" "scratchapp" {
  for_each = fileset("../../apps/scratch/build", "**")
  bucket   = aws_s3_bucket.scratchapp.id
  key      = each.value
  source   = "../../apps/scratch/build/${each.value}"
  etag     = filemd5("../../apps/scratch/build/${each.value}")
  # set the content type based on the file extension
  content_type = lookup(local.mime_types, reverse(split(".", basename(each.value)))[0], "application/octet-stream")
}

