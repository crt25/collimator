locals {
  domain_name_reversed_parts    = reverse(split(".", module.globals.domain_name))
  domain_name_without_subdomain = "${local.domain_name_reversed_parts[1]}.${local.domain_name_reversed_parts[0]}"
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 4.0"

  domain_name = module.globals.domain_name

  # https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html#how-email-validation-works
  validation_method = "EMAIL"
  validation_option = {
    main : {
      "domain_name" : module.globals.domain_name
      "validation_domain" : local.domain_name_without_subdomain
    }
  }

  tags = module.globals.tags
}

