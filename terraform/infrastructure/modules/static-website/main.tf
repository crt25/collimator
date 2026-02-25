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

# create a Node.js lambda function package to rewrite URLs
# the package is created as documented at https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html#nodejs-package-create-no-dependencies
data "archive_file" "lambda_function" {
  type        = "zip"
  source_file = var.nodejs_lambda_function_path
  output_path = var.lambda_function_output_zip
}

# create the lambda function based on the package
module "spa_lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 8.5"

  providers = {
    aws = aws.cloudfront_region_provider
  }

  function_name = "${var.name}-rewrite"
  description   = "A lambda function to rewrite URLs for CloudFront"
  handler       = "index.handler"

  # see https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html#runtimes-supported
  # for a list of supported runtimes
  runtime = "nodejs24.x"

  publish        = true
  lambda_at_edge = true

  create_package         = false
  local_existing_package = data.archive_file.lambda_function.output_path

  cloudwatch_logs_retention_in_days = 90

  tags = var.tags
}


