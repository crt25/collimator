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
  value       = module.vpc.private_subnets
  description = "List of private subnet ids"
}

output "private_subnets_cidr_blocks" {
  value       = module.vpc.private_subnets_cidr_blocks
  description = "List of cidr_blocks of private subnets"
}

output "public_subnet_ids" {
  value       = module.vpc.public_subnets
  description = "List of public subnet ids"
}

output "private_subnet_objects" {
  value       = module.vpc.private_subnet_objects
  description = "A list of all private subnets, containing the full objects (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet)."
}

output "database_subnet_group_name" {
  value       = module.vpc.database_subnet_group_name
  description = "Name of the first database subnet group"
}
