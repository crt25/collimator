variable "bucket_id" {
  type = string
}

variable "directory" {
  type = string
}

variable "region" {
  type    = string
  default = "eu-central-2"
}

variable "bucket_path_prefix" {
  type        = string
  default     = ""
  description = "A prefix to add to the object key in the bucket. Effectively a prefix path allowing you to put the files in a subdirectory within the bucket."
}
