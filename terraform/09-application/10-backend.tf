locals {
  container_name = "backend"
  container_port = 3001
}

module "ecs_service" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "~> 5.6"

  name          = "${module.globals.name}-prod-apps-backend"
  desired_count = 1
  cluster_arn   = module.ecs_cluster.arn

  # Task Definition
  enable_execute_command = true

  container_definitions = {
    (local.container_name) = {
      image                    = module.containers.backend_repository_url
      readonly_root_filesystem = false

      port_mappings = [
        {
          protocol      = "tcp",
          containerPort = local.container_port
        }
      ]
      environment = [
        {
          name  = "PORT",
          value = local.container_port
        },
        {
          name  = "DATABASE_URL",
          value = "postgresql://${local.database_user}:${random_password.database.result}@${module.database.db_instance_address}:5432/${local.database_name}?schema=public"
        }
      ]
    }
  }

  service_registries = {
    registry_arn = aws_service_discovery_service.this.arn
  }

  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["backend"].arn
      container_name   = local.container_name
      container_port   = local.container_port
    }
  }

  subnet_ids = module.vpc.private_subnets
  security_group_rules = {
    ingress_alb_service = {
      type                     = "ingress"
      from_port                = local.container_port
      to_port                  = local.container_port
      protocol                 = "tcp"
      description              = "Backend"
      source_security_group_id = module.alb.security_group_id
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = module.globals.tags
}
