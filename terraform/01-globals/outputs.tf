output "vpc_cidr" {
  value = "10.0.0.0/16"
}

output "name" {
  value = "collimator"
}

output "domain_name" {
  value = "collimator.tyratox.ch"
}

output "loadbalancer_subdomain" {
  value = "lb"
}

output "tags" {
  value = {
    Name = "collimator"
  }
}
