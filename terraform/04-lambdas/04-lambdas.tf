# create a Node.js lambda function package to rewrite SPA URLs
# the package is created as documented at https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html#nodejs-package-create-no-dependencies
data "archive_file" "spa_lambda_function" {
  type        = "zip"
  source_file = "${var.lambdas_path}/src/spa/index.js"
  output_path = "${var.lambdas_path}/build/spa.zip"
}

# create the lambda function based on the package
module "spa_lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 7.0"


  function_name = "${module.globals.name}-prod-apps-spa-rewrite"
  description   = "A lambda function to rewrite SPA URLs for CloudFront"
  handler       = "index.handler"

  # see https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html#API_CreateFunction_RequestBody
  # for a list of supported runtimes
  runtime = "nodejs20.x"

  publish        = true
  lambda_at_edge = true

  create_package         = false
  local_existing_package = data.archive_file.spa_lambda_function.output_path
}


data "archive_file" "next_lambda_function" {
  type        = "zip"
  source_file = "${var.lambdas_path}/src/next/index.js"
  output_path = "${var.lambdas_path}/build/next.zip"
}

# create the lambda function based on the package
module "next_lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 7.0"


  function_name = "${module.globals.name}-prod-apps-next-rewrite"
  description   = "A lambda function to rewrite Next.js URLs for CloudFront"
  handler       = "index.handler"

  runtime = "nodejs20.x"

  publish        = true
  lambda_at_edge = true

  create_package         = false
  local_existing_package = data.archive_file.next_lambda_function.output_path
}
