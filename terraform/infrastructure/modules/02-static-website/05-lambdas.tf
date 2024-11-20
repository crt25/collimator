

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
  version = "~> 7.0"

  providers = {
    aws = aws.cloudfront_region_provider
  }

  function_name = "${var.name}-rewrite"
  description   = "A lambda function to rewrite URLs for CloudFront"
  handler       = "index.handler"

  # see https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html#API_CreateFunction_RequestBody
  # for a list of supported runtimes
  runtime = "nodejs20.x"

  publish        = true
  lambda_at_edge = true

  create_package         = false
  local_existing_package = data.archive_file.lambda_function.output_path

  tags = var.tags
}


