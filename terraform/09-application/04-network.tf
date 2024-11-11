module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = module.globals.name
  cidr = module.globals.vpc_cidr

  azs = local.azs

  create_database_subnet_group = true

  # divide /16 into a public /24, one private /25, and one database /25
  public_subnets   = [for k, v in local.azs : cidrsubnet(module.globals.vpc_cidr, 8, k)]
  private_subnets  = [for k, v in local.azs : cidrsubnet(module.globals.vpc_cidr, 8, k + 128)]
  database_subnets = [for k, v in local.azs : cidrsubnet(module.globals.vpc_cidr, 8, k + 128 + 64)]

  enable_nat_gateway = true
  single_nat_gateway = true


  # Manage so we can name
  manage_default_network_acl = true
  default_network_acl_tags   = { Name = "${module.globals.name}-default" }

  manage_default_route_table = true
  default_route_table_tags   = { Name = "${module.globals.name}-default" }

  manage_default_security_group = true
  default_security_group_tags   = { Name = "${module.globals.name}-default" }

  tags = module.globals.tags
}
