output "zone_id" {
  value = values(module.zones.route53_zone_zone_id)[0]
}
