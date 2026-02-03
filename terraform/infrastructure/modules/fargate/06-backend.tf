locals {
  container_name = "backend"
  container_port = 3001
}

module "ecs_service" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "~> 7.3"

  name          = var.name
  desired_count = 1
  cluster_arn   = module.ecs_cluster.arn

  # Task Definition
  enable_execute_command = true

  container_definitions = {
    (local.container_name) = {
      image                    = module.ecr_backend.repository_url
      readonlyRootFilesystem   = false

      portMappings = [
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
      secrets = [
        {
            name      = "DATABASE_URL"
            valueFrom = var.database_url_arn
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
  security_group_ingress_rules = {
    ingress_alb_service = {
      from_port                    = local.container_port
      to_port                      = local.container_port
      ip_protocol                  = "tcp"
      description                  = "Backend"
      referenced_security_group_id = module.alb.security_group_id
    }
  }

  security_group_egress_rules = {
    egress_all = {
      # You may not specify all protocols and specific ports. Please specify each protocol
      # and port range combination individually, or all protocols and no port range.
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  tags = var.tags
}
