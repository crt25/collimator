output "spa_arn" {
  value = module.spa_lambda_function.lambda_function_qualified_arn
}

output "next_arn" {
  value = module.next_lambda_function.lambda_function_qualified_arn
}
