module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws//modules/cluster"
  version = "~> 7.3"

  name = var.name

  service_connect_defaults = {
    namespace = var.private_dns_arn
  }

  cluster_capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  default_capacity_provider_strategy = {
    FARGATE = {
      weight = 50
      base   = 1
    }
    FARGATE_SPOT = {
      weight = 50
    }
  }

  tags = var.tags
}
