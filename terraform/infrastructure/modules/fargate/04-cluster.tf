module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws//modules/cluster"
  version = "~> 5.6"

  cluster_name = var.name

  cluster_service_connect_defaults = {
    namespace = var.private_dns_arn
  }

  fargate_capacity_providers = {
    FARGATE      = {}
    FARGATE_SPOT = {}
  }

  tags = var.tags
}
