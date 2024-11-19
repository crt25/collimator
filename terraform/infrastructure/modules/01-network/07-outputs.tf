output "certificte_arn" {
  value = module.acm.acm_certificate_arn
}

output "private_dns_arn" {
  value = aws_service_discovery_private_dns_namespace.this.arn
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "discovery_service_arn" {
  value = aws_service_discovery_service.this.arn
}

output "private_subnet_ids" {
  value = module.vpc.private_subnets
}

output "private_subnets_cidr_blocks" {
  value = module.vpc.private_subnets_cidr_blocks
}

output "public_subnet_ids" {
  value = module.vpc.public_subnets
}

output "private_subnet_objects" {
  value = module.vpc.private_subnet_objects
}

output "database_subnet_group_name" {
  value = module.vpc.database_subnet_group_name
}
