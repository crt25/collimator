locals {
  container_name = "backend"
  container_port = 3001
}

module "ecs_service" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "~> 5.6"

  name          = var.name
  desired_count = 1
  cluster_arn   = module.ecs_cluster.arn

  # Task Definition
  enable_execute_command = true

  container_definitions = {
    (local.container_name) = {
      image                    = module.ecr_backend.repository_url
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
          value = var.database_url
        },
        {
          name  = "FRONTEND_HOSTNAME",
          value = "https://${var.domain_name}"
        },
        {
          name  = "OPEN_ID_CONNECT_JWK_ENDPOINT",
          value = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
        },
        {
          name  = "OPEN_ID_CONNECT_USERINFO_ENDPOINT",
          value = "https://graph.microsoft.com/oidc/userinfo"
        },
        {
          name  = "OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID",
          value = var.open_id_connect_microsoft_client_id
        },
        {
          name  = "SENTRY_DSN",
          value = var.sentry_dsn
        },
        {
          name  = "SENTRY_ENVIRONMENT",
          value = var.environment
        }
      ]
    }
  }

  service_registries = {
    registry_arn = var.discovery_service_arn
  }

  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["backend"].arn
      container_name   = local.container_name
      container_port   = local.container_port
    }
  }

  subnet_ids = var.private_subnet_ids
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

  tags = var.tags
}
