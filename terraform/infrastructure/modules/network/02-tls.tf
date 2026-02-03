locals {
  domain_name_reversed_parts    = reverse(split(".", var.domain_name))
  domain_name_without_subdomain = "${local.domain_name_reversed_parts[1]}.${local.domain_name_reversed_parts[0]}"
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 6.3"
  providers = {
    // the certificate for cloudfront must be in the US
    aws = aws.cloudfront_region_provider
  }

  domain_name = var.domain_name

  # https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html#how-email-validation-works
  validation_method   = "EMAIL"
  wait_for_validation = false

  # Validation emails will be send to a fixed list of recipients:
  # admin@VALIDATION_DOMAIN, administrator@VALIDATION_DOMAIN, hostmaster@VALIDATION_DOMAIN, postmaster@VALIDATION_DOMAIN, webmaster@VALIDATION_DOMAIN
  # validation_domain has to be a top-level domain of the actual domain
  validation_option = {
    (var.domain_name) = {
      validation_domain = local.domain_name_without_subdomain
    }
  }

  tags = var.tags
}

