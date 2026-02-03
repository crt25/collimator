resource "aws_service_discovery_private_dns_namespace" "this" {
  name = "default.${var.name}.local"
  vpc  = module.vpc.vpc_id

  tags = var.tags
}


resource "aws_service_discovery_service" "this" {
  name = var.name

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.this.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {}

  tags = var.tags

  lifecycle {
    ignore_changes = [health_check_custom_config]
  }
}
