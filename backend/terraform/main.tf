terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0.0"

  backend "s3" {
    /* Will be filled in dynamically by CI/CD pipeline */
  }
}

provider "aws" {
  region = var.aws_region
  alias  = "assume_role"
  assume_role {
    role_arn = "arn:aws:iam::${var.aws_account_id}:role/AIWizardDeploymentRole"
  }
}

locals {
  common_tags = {
    Project     = "ai-wizard"
    ManagedBy   = "Terraform"
    Environment = var.environment
  }
}

# S3 bucket for Zappa deployments
resource "aws_s3_bucket" "zappa_deployments" {
  provider = aws.assume_role
  bucket   = "ai-wizard-zappa-deployments"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-zappa-deployments"
  })
}

# DynamoDB table
resource "aws_dynamodb_table" "ai_wizard" {
  provider         = aws.assume_role
  name             = "ai-wizard-table"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-dynamodb-table"
  })
}

# IAM role for Lambda (to be used by Zappa)
resource "aws_iam_role" "lambda_exec" {
  provider = aws.assume_role
  name     = "ai-wizard-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = merge(local.common_tags, {
    Name = "ai-wizard-lambda-exec-role"
  })
}

# IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  provider   = aws.assume_role
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# IAM policy for Lambda basic execution
resource "aws_iam_role_policy_attachment" "lambda_basic_exec" {
  provider   = aws.assume_role
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 bucket for frontend hosting
resource "aws_s3_bucket" "frontend" {
  provider = aws.assume_role
  bucket   = "ai-wizard-frontend"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-frontend"
  })
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  provider = aws.assume_role
  bucket   = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  provider                = aws.assume_role
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  provider = aws.assume_role
  bucket   = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      },
    ]
  })
}

# ACM Certificate
resource "aws_acm_certificate" "frontend" {
  provider          = aws.assume_role
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-frontend-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Route 53 record for ACM certificate validation
resource "aws_route53_record" "acm_validation" {
  provider = aws.assume_role
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.assume_role
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  provider = aws.assume_role
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.frontend.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-frontend-cdn"
  })
}

# Route 53 record for frontend
resource "aws_route53_record" "frontend" {
  provider = aws.assume_role
  zone_id  = var.route53_zone_id
  name     = var.domain_name
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# Outputs
output "dynamodb_table_name" {
  value = aws_dynamodb_table.ai_wizard.name
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}

output "frontend_bucket_website_endpoint" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "zappa_deployment_bucket" {
  value = aws_s3_bucket.zappa_deployments.id
}

output "cloudfront_distribution_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "website_url" {
  value = "https://${var.domain_name}"
}
