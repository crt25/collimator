variable "name" {
  # something like collimator-dev-tf-state
  type = string
}

variable "region" {
  type = string
  default = "eu-central-2"
}

variable "tags" {
  type = map(string)
  default = {
    Name        = "collimator"
    Environment = "dev"
    TFState     = "true"
  }
}
