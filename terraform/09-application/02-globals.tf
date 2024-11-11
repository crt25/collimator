data "aws_availability_zones" "available" {}

locals {
  region = "eu-central-2"

  # 3 availability zones to limit the costs
  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}
