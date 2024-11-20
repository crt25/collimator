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
  default = "../../apps/scratch/build"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "bucket" {
  type    = string
  default = "collimator-prod-cd-tf-state"
}
