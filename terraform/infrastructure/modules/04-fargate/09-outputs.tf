output "backend_repository_url" {
  value = module.ecr_backend.repository_url
}

output "backend_arn" {
  value = module.ecr_backend.repository_arn
}

output "backend_dns_name" {
  value = module.alb.dns_name
}

output "repository_url" {
  value = module.ecr_backend.repository_url
}
