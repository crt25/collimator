resource "aws_cloudfront_origin_request_policy" "websocket" {
  name    = "${var.name}-cloudfront-websockets"
  comment = "Websocket Header Allow Policy"

  cookies_config {
    cookie_behavior = "none"
  }

  query_strings_config {
    query_string_behavior = "all"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Sec-WebSocket-Key",
        "Sec-WebSocket-Version",
        "Sec-WebSocket-Protocol",
        "Sec-WebSocket-Accept"
      ]
    }
  }
}

# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-caching-optimized-uncompressed
data "aws_cloudfront_cache_policy" "no_caching" {
  name = "Managed-CachingDisabled"
}

# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer
data "aws_cloudfront_origin_request_policy" "pass_all_headers" {
  name = "Managed-AllViewer"
}

# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-security
data "aws_cloudfront_response_headers_policy" "security_headers_policy" {
  name = "Managed-SecurityHeadersPolicy"
}

module "cloudfront" {
  source = "terraform-aws-modules/cloudfront/aws"

  aliases = [var.domain_name]

  enabled         = true
  staging         = false
  http_version    = "http2and3"
  is_ipv6_enabled = true

  # make it a bit cheaper. other options are PriceClass_200 and PriceClass_All
  price_class      = "PriceClass_100"
  retain_on_delete = false

  # deployment for cloudfront usually takes a while
  wait_for_deployment = false

  # When you enable additional metrics for a distribution, CloudFront sends up to 8 metrics to CloudWatch in the US East (N. Virginia) Region.
  # This rate is charged only once per month, per metric (up to 8 metrics per distribution).
  create_monitoring_subscription = true

  create_origin_access_identity = false

  create_origin_access_control = true
  origin_access_control = {
    # we need to allow cloudfront to access S3 buckets
    s3_oac = {
      description      = "CloudFront S3 Origin Access Control"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

  # logging is disabled for now
  # logging_config = {
  #   bucket = module.log_bucket.s3_bucket_bucket_domain_name
  #   prefix = "cloudfront"
  # }

  origin = {
    frontend = {
      domain_name           = var.frontend_domain_name
      origin_access_control = "s3_oac" # key in `origin_access_control` map
    }

    scratchapp = {
      domain_name           = var.scratchapp_domain_name
      origin_access_control = "s3_oac"
    }

    jupyterapp = {
      domain_name           = var.jupyterapp_domain_name
      origin_access_control = "s3_oac"
    }

    backend = {
      domain_name = var.backend_domain_name
      custom_origin_config = {
        http_port              = 80
        origin_protocol_policy = "http-only"

        https_port           = 443
        origin_ssl_protocols = ["TLSv1.2"]
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = "frontend" # key in `origin` map
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]

    use_forwarded_values = false

    cache_policy_id            = data.aws_cloudfront_cache_policy.no_caching.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers_policy.id

    lambda_function_association = {
      # run the Next.js rewrite lambda function on the origin request
      # see https://smarx.com/posts/2020/08/url-rewriting-with-lambda-at-edge/
      # for a discussion of up- and downsides of viewer-request vs. origin-request
      origin-request = {
        lambda_arn = var.frontend_lambda_arn
      }
    }
  }

  ordered_cache_behavior = [
    {
      path_pattern           = "/api*"
      target_origin_id       = "backend"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]

      use_forwarded_values = false

      cache_policy_id            = data.aws_cloudfront_cache_policy.no_caching.id
      origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.pass_all_headers.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers_policy.id
    },
    {
      path_pattern           = "/socket.io*"
      target_origin_id       = "backend"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]

      use_forwarded_values = false

      cache_policy_id = data.aws_cloudfront_cache_policy.no_caching.id
      # allow websocket connections
      origin_request_policy_id   = aws_cloudfront_origin_request_policy.websocket.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers_policy.id
    },
    {
      path_pattern           = "/scratch*"
      target_origin_id       = "scratchapp"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD"]

      use_forwarded_values = false

      # disable caching
      cache_policy_id            = data.aws_cloudfront_cache_policy.no_caching.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers_policy.id

      lambda_function_association = {
        # run the spa rewrite lambda function on the origin request
        origin-request = {
          lambda_arn = var.scratchapp_lambda_arn
        }
      }
    },
    {
      path_pattern           = "/jupyter*"
      target_origin_id       = "jupyterapp"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD"]

      use_forwarded_values = false

      # disable caching
      cache_policy_id            = data.aws_cloudfront_cache_policy.no_caching.id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers_policy.id
    }
  ]


  viewer_certificate = {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = var.tags
}

# allow access to the S3 bucket from CloudFront
data "aws_iam_policy_document" "s3_scratchapp_policy" {
  # Origin Access Controls
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    actions   = ["s3:GetObject"]
    resources = ["${var.scratchapp_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "scratchapp_bucket_policy" {
  bucket = var.scratchapp_bucket
  policy = data.aws_iam_policy_document.s3_scratchapp_policy.json
}

data "aws_iam_policy_document" "s3_jupyterapp_policy" {
  # Origin Access Controls
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    actions   = ["s3:GetObject"]
    resources = ["${var.jupyterapp_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "jupyterapp_bucket_policy" {
  bucket = var.jupyterapp_bucket
  policy = data.aws_iam_policy_document.s3_jupyterapp_policy.json
}

data "aws_iam_policy_document" "s3_frontend_policy" {
  # Origin Access Controls
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    actions   = ["s3:GetObject"]
    resources = ["${var.frontend_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = var.frontend_bucket
  policy = data.aws_iam_policy_document.s3_frontend_policy.json
}
