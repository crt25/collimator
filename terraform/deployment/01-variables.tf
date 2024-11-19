variable "frontend_bucket_id" {
  type = string
}

variable "frontend_build_directory" {
  type    = string
  default = "../../frontend/build"
}

variable "scratchapp_bucket_id" {
  type = string
}

variable "scratchapp_build_directory" {
  type    = string
  default = "../../apps/scratch/build"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}
