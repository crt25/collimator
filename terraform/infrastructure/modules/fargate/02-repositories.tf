module "ecr_backend" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 3.2"

  repository_name                 = var.name
  repository_image_tag_mutability = "MUTABLE"

  repository_read_write_access_arns = [data.aws_caller_identity.current.arn]

  create_lifecycle_policy = true
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last ten images",
        selection = {
          tagStatus     = "untagged",
          countType     = "imageCountMoreThan",
          countNumber   = 10
        },
        action = {
          type = "expire"
        }
      }
    ]
  })

  # allow the ECR repository to be deleted even if it is not empty
  repository_force_delete = false

  tags = var.tags
}
