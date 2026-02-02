# the registry always exists. we could configure it using the following but it is not necessary for now

# module "ecr_registry" {
#   source = "terraform-aws-modules/ecr/aws"
#   version = "~> 3.2"

#   # this is a registry, not a repository
#   create_repository = false

#   # No need for a policy for now
#   create_registry_policy = false

#   # Do not scan images for vulnerabilities
#   manage_registry_scanning_configuration = false

#   # Do not replicate images to other regions
#   create_registry_replication_configuration = false

#   tags = var.tags
# }
