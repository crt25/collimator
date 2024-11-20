
# allow github actions to provide identities to AWS
resource "aws_iam_openid_connect_provider" "this" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  # Mandatory field but not used - we don't want to pin the certificate, we trust the domain.
  thumbprint_list = ["ffffffffffffffffffffffffffffffffffffffff"]

  tags = var.tags
}

# create a role that github actions will assume
data "aws_iam_policy_document" "oidc" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.this.arn]
    }

    condition {
      test     = "StringEquals"
      values   = ["sts.amazonaws.com"]
      variable = "token.actions.githubusercontent.com:aud"
    }

    condition {
      test = "StringLike"
      # allow one repo within the organization to assume the role
      # but allow all branches - replace the * with a branch name if needed
      values   = ["repo:${var.organization_name}/${var.repo_name}:*"]
      variable = "token.actions.githubusercontent.com:sub"
    }
  }
}

resource "aws_iam_role" "this" {
  name               = "github-oidc-role-${var.organization_name}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.oidc.json

  tags = var.tags
}

# attach a policy to the role that allows ECR access

# create a policy template
data "aws_iam_policy_document" "deploy" {
  # ECR permissions
  # allow pushing new ECR images
  # https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonelasticcontainerregistry.html
  # https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push-iam.html
  statement {
    effect = "Allow"
    actions = [

      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:BatchGetImage"
    ]
    resources = var.ecr_repository_arns
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }

  # S3 permissions
  # allow reading and writing to the S3 bucket
  # https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_s3_rw-bucket.html

  statement {
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = var.s3_bucket_arns
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:*Object",
      "s3:ListMultipartUploadParts",
      "s3:GetObjectVersion",
      "s3:GetObjectTagging",
    ]
    resources = [for arn in var.s3_bucket_arns : "${arn}/*"]
  }
}

# an instance of that policy
resource "aws_iam_policy" "deploy" {
  name        = "ci-deploy-policy-${var.organization_name}-${var.environment}"
  description = "Policy used for deployments on CI"
  policy      = data.aws_iam_policy_document.deploy.json

  tags = var.tags
}

# and attach it to the role
resource "aws_iam_role_policy_attachment" "attach-deploy" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.deploy.arn
}
