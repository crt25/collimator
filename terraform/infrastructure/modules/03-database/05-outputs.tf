output "database_url" {
  value     = "postgresql://${local.database_user}:${random_password.database.result}@${module.database.db_instance_address}:5432/${local.database_name}?schema=public"
  sensitive = true
}
