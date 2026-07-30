terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.75.0"
    }
  }

  cloud {
    hostname = "classmosaic.scalr.io"
    organization = "classmosaic-dev"

    workspaces {
      name = "classmosaic-dev"
    }
  }
}
