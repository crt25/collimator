variable "bucket_id" {
  type = string
}

variable "build_directory" {
  type    = string
  default = "../../frontend/build"
}

variable "region" {
  type    = string
  default = "eu-central-2"
}
