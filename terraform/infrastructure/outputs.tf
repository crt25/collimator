output "frontend_bucket_id" {
  value = module.frontend.bucket_id
}

output "frontend_bucket_arn" {
  value = module.frontend.bucket_arn
}

output "scratchapp_bucket_id" {
  value = module.scratchapp.bucket_id
}

output "scratchapp_bucket_arn" {
  value = module.scratchapp.bucket_arn
}

output "jupyterapp_bucket_id" {
  value = module.jupyterapp.bucket_id
}

output "jupyterapp_bucket_arn" {
  value = module.jupyterapp.bucket_arn
}

output "backend_repository_url" {
  value = module.backend.backend_repository_url
}

output "backend_arn" {
  value = module.backend.backend_arn
}

output "cd_backend_bucket" {
  value = module.cd_backend.bucket
}
