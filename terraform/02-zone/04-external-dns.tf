module "zones" {
  source  = "terraform-aws-modules/route53/aws//modules/zones"
  version = "~> 3.0"

  zones = {
    "${module.globals.domain_name}" = {
    }
  }

  tags = module.globals.tags
}
