output "frontend_bucket_id" {
  value = module.frontend.bucket_id
}

output "scratchapp_bucket_id" {
  value = module.scratchapp.bucket_id
}

output "backend_repository_url" {
  value = module.backend.backend_repository_url
}
