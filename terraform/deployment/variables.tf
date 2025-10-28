variable "frontend_bucket_id" {
  type = string
}

variable "frontend_build_directory" {
  type    = string
  default = "../../frontend/dist"
}

variable "scratchapp_bucket_id" {
  type = string
}

variable "scratchapp_build_directory" {
  type    = string
  default = "../../apps/jupyter/build"
}

variable "jupyterapp_bucket_id" {
  type = string
}

variable "jupyterapp_build_directory" {
  type    = string
  default = "../../apps/jupyter/dist/app"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "tfstate_bucket_name" {
  type = string
}
