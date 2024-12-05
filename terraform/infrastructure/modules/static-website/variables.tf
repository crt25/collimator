variable "name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "region" {
  type = string
}

variable "nodejs_lambda_function_path" {
  type = string
}

variable "lambda_function_output_zip" {
  type = string
}
