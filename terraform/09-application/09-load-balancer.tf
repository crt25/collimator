module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name = "${module.globals.name}-prod-alb"

  # For example only
  enable_deletion_protection = false

  vpc_id  = module.vpc.vpc_id
  subnets = module.vpc.public_subnets
  security_group_ingress_rules = {
    all_http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      description = "HTTP web traffic"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  security_group_egress_rules = {
    for subnet in module.vpc.private_subnet_objects : (subnet.availability_zone) => {
      ip_protocol = "-1"
      cidr_ipv4   = subnet.cidr_block
    }
  }


  listeners = {
    external = {
      port     = 80
      protocol = "HTTP"

      forward = {
        target_group_key = "backend"
      }
    }
  }

  target_groups = {
    backend = {
      backend_protocol = "HTTP"
      backend_port     = local.container_port
      target_type      = "ip"

      health_check = {
        enabled             = true
        healthy_threshold   = 5
        interval            = 30
        matcher             = "200-299"
        path                = "/api"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
      }

      # There's nothing to attach here in this definition. Instead,
      # ECS will attach the IPs of the tasks to this target group
      create_attachment = false
    }
  }

  tags = module.globals.tags
}
