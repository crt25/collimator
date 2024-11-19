﻿module "network" {
  source = "./modules/01-network"

  name        = "${var.name}-prod"
  region      = var.region
  vpc_cidr    = var.vpc_cidr
  domain_name = var.domain_name

  tags = var.tags
}

module "frontend" {
  source = "./modules/02-static-website"

  name   = "${var.name}-prod-frontend"
  region = var.region

  nodejs_lambda_function_path      = "./lambdas/src/next/index.js"
  lambda_function_output_directory = local.lambda_function_output_directory

  tags = var.tags
}

module "scratchapp" {
  source = "./modules/02-static-website"

  name   = "${var.name}-prod-apps-scratch"
  region = var.region

  nodejs_lambda_function_path      = "./lambdas/src/spa/index.js"
  lambda_function_output_directory = local.lambda_function_output_directory

  tags = var.tags
}

module "database" {
  source = "./modules/03-database"

  name   = "${var.name}-prod-database"
  region = var.region

  vpc_id                      = module.network.vpc_id
  database_subnet_group_name  = module.network.database_subnet_group_name
  private_subnets_cidr_blocks = module.network.private_subnets_cidr_blocks

  tags = var.tags
}

module "backend" {
  source = "./modules/04-fargate"

  name   = "${var.name}-prod-backend"
  region = var.region

  vpc_id                 = module.network.vpc_id
  discovery_service_arn  = module.network.discovery_service_arn
  private_dns_arn        = module.network.private_dns_arn
  private_subnet_ids     = module.network.private_subnet_ids
  private_subnet_objects = module.network.private_subnet_objects
  public_subnet_ids      = module.network.public_subnet_ids

  database_url = module.database.database_url

  tags = var.tags
}

module "cdn" {
  source = "./modules/05-cloudfront"

  name        = "${var.name}-prod-cdn"
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
