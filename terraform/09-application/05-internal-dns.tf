﻿resource "aws_service_discovery_private_dns_namespace" "this" {
  name        = "default.${module.globals.name}.local"
  description = "Service discovery <namespace>.<clustername>.local"
  vpc         = module.vpc.vpc_id

  tags = module.globals.tags
}


resource "aws_service_discovery_service" "this" {
  name = module.globals.name

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.this.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = module.globals.tags
}
