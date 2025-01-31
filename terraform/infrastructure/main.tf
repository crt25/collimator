locals {
  lambda_function_output_directory = "./lambdas/build"
}

module "network" {
  source = "./modules/network"

  name        = "${var.name}-${var.environment}-network"
  region      = var.region
  vpc_cidr    = var.vpc_cidr
  domain_name = var.domain_name

  tags = var.tags
}

module "frontend" {
  source = "./modules/static-website"

  name   = "${var.name}-${var.environment}-static-frontend"
  region = var.region

  nodejs_lambda_function_path = "./lambdas/src/next/index.js"
  lambda_function_output_zip  = "${local.lambda_function_output_directory}/next.zip"

  tags = var.tags
}

module "scratchapp" {
  source = "./modules/static-website"

  name   = "${var.name}-${var.environment}-app-scratch"
  region = var.region

  nodejs_lambda_function_path = "./lambdas/src/spa/index.js"
  lambda_function_output_zip  = "${local.lambda_function_output_directory}/spa.zip"

  tags = var.tags
}

module "database" {
  source = "./modules/database"

  name   = "${var.name}-${var.environment}-database"
  region = var.region

  vpc_id                      = module.network.vpc_id
  database_subnet_group_name  = module.network.database_subnet_group_name
  private_subnets_cidr_blocks = module.network.private_subnets_cidr_blocks

  tags = var.tags
}

module "backend" {
  source = "./modules/fargate"

  name        = "${var.name}-${var.environment}-backend"
  environment = var.environment
  domain_name = var.domain_name
  region      = var.region

  vpc_id                 = module.network.vpc_id
  discovery_service_arn  = module.network.discovery_service_arn
  private_dns_arn        = module.network.private_dns_arn
  private_subnet_ids     = module.network.private_subnet_ids
  private_subnet_objects = module.network.private_subnet_objects
  public_subnet_ids      = module.network.public_subnet_ids

  open_id_connect_microsoft_client_id = var.open_id_connect_microsoft_client_id
  sentry_dsn                          = var.sentry_dsn 
  database_url                        = module.database.database_url

  tags = var.tags
}

module "cdn" {
  source = "./modules/cloudfront"

  name        = "${var.name}-${var.environment}-cdn"
  region      = var.region
  domain_name = var.domain_name

  frontend_bucket      = module.frontend.bucket
  frontend_bucket_arn  = module.frontend.bucket_arn
  frontend_lambda_arn  = module.frontend.lambda_arn
  frontend_domain_name = module.frontend.bucket_domain_name

  scratchapp_bucket      = module.scratchapp.bucket
  scratchapp_bucket_arn  = module.scratchapp.bucket_arn
  scratchapp_lambda_arn  = module.scratchapp.lambda_arn
  scratchapp_domain_name = module.scratchapp.bucket_domain_name

  backend_domain_name = module.backend.backend_dns_name
  certificate_arn     = module.network.certificte_arn

  tags = var.tags
}

module "cd_backend" {
  source = "./modules/cd-backend"

  name   = "${var.name}-${var.environment}-cd-tf-state"
  region = var.region

  tags = var.tags
}
