locals {
  database_name = "collimator"
  database_user = "collimator"
}

module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${module.globals.name}-prod-db-main"
  description = "PostgreSQL database security group"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    for block in module.vpc.private_subnets_cidr_blocks :
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      description = "PostgreSQL access from within private subnet"
      cidr_blocks = block
    }
  ]

  tags = module.globals.tags
}

resource "random_password" "database" {
  length  = 36
  special = true
  // postgres does not allow '@', '"', or '\' in passwords, see https://github.com/awsdocs/aws-cloudformation-user-guide/blob/c03a45977c5a506e09a22dbe05ff980bec79b805/doc_source/aws-properties-rds-database-instance.md#cfn-rds-dbinstance-masteruserpassword
  // also ':' seems to cause issues because prisma thinks the port follows
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

module "database" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "${module.globals.name}-prod-db-main"

  engine = "postgres"
  # All available versions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.DBVersions.html
  engine_version           = "16"
  engine_lifecycle_support = "open-source-rds-extended-support-disabled"
  family                   = "postgres16"
  major_engine_version     = "16"

  auto_minor_version_upgrade = true

  instance_class = "db.t3.micro"

  # DB instance storage - will be increased when needed
  allocated_storage     = 5
  max_allocated_storage = 10

  db_name  = local.database_name
  username = local.database_user

  manage_master_user_password = false
  password                    = random_password.database.result
  port                        = "5432"

  multi_az = false

  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [module.security_group.security_group_id]

  # when AWS is allowed to perform maintenance
  maintenance_window = "Mon:00:00-Mon:03:00"

  # daily backup window
  backup_window           = "03:00-06:00"
  backup_retention_period = 7
  # create a final snapshot before deleting the database
  skip_final_snapshot = false
  deletion_protection = false

  performance_insights_enabled = false
  create_monitoring_role       = false

  parameters = [
    {
      # https://www.postgresql.org/docs/current/routine-vacuuming.html
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    }
  ]

  tags = module.globals.tags
}
