terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
    }
  }
  required_version = ">= 1.2.0"

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

provider "aws" {
  region = "us-east-1"
  alias  = "assume_role_us_east_1"
  assume_role {
    role_arn = "arn:aws:iam::${var.aws_account_id}:role/AIWizardDeploymentRole"
  }
}

locals {
  common_tags = {
    Project     = "ai-wizard"
    ManagedBy   = "Terraform"
    Environment = "${var.environment}"
  }
}

# S3 bucket for Zappa deployments
resource "aws_s3_bucket" "zappa_deployments" {
  provider = aws.assume_role
  bucket   = "${var.zappa_deployments_bucket_name}"

  tags = merge(local.common_tags, {
    Name = "${var.zappa_deployments_bucket_name}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# DynamoDB table
resource "aws_dynamodb_table" "ai_wizard" {
  provider         = aws.assume_role
  name             = "${var.dynamodb_table_name}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  tags = merge(local.common_tags, {
    Name = "${var.dynamodb_table_name}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = true
  }
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
    Service = "ai-wizard-backend"
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
  bucket   = var.frontend_bucket_name

  tags = merge(local.common_tags, {
    Name = var.frontend_bucket_name
    Service = "ai-wizard-frontend"
  })
}

# S3 bucket private access configuration
resource "aws_s3_bucket_public_access_block" "frontend" {
  provider                = aws.assume_role
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy to allow access only from CloudFront
resource "aws_s3_bucket_policy" "frontend" {
  provider = aws.assume_role
  bucket   = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# S3 bucket website configuration
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

resource "aws_acm_certificate" "frontend" {
  provider          = aws.assume_role_us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-frontend-cert"
    Service = "ai-wizard-frontend"  
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
  zone_id         = var.route53_hosted_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.assume_role_us_east_1
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "frontend" {
  provider = aws.assume_role
  comment  = "OAI for ${var.domain_name}"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  provider = aws.assume_role
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
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
    Service = "ai-wizard-frontend"
  })
}

# Route 53 record for frontend
resource "aws_route53_record" "frontend" {
  provider = aws.assume_role
  zone_id  = var.route53_hosted_zone_id
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

# API Gateway
resource "aws_api_gateway_rest_api" "ai_wizard" {
  provider    = aws.assume_role
  name        = "ai-wizard-backend-api"
  description = "AI Wizard Backend API"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-backend-api"
    Service = "ai-wizard-backend"
  })
}

# Lambda Function
resource "aws_lambda_function" "ai_wizard" {
  provider         = aws.assume_role
  filename         = "lambda_function.zip"  # This will be an empty zip initially
  function_name    = "ai-wizard-backend-lambda"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64sha256("lambda_function.zip")

  environment {
    variables = {
      OPENAI_API_KEY = var.openai_api_key
      DATABASE_URL   = var.database_url
    }
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-backend-lambda"
    Service = "ai-wizard-backend"
  })
}

# API Gateway Integration
resource "aws_api_gateway_resource" "proxy" {
  provider    = aws.assume_role
  rest_api_id = aws_api_gateway_rest_api.ai_wizard.id
  parent_id   = aws_api_gateway_rest_api.ai_wizard.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  provider      = aws.assume_role
  rest_api_id   = aws_api_gateway_rest_api.ai_wizard.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  provider                = aws.assume_role
  rest_api_id             = aws_api_gateway_rest_api.ai_wizard.id
  resource_id             = aws_api_gateway_method.proxy.resource_id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.ai_wizard.invoke_arn
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "apigw" {
  provider      = aws.assume_role
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ai_wizard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.ai_wizard.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "ai_wizard" {
  provider  = aws.assume_role
  depends_on = [aws_api_gateway_integration.lambda]

  rest_api_id = aws_api_gateway_rest_api.ai_wizard.id
  stage_name  = "${var.environment}"

  lifecycle {
    create_before_destroy = true
  }
}

# Output the API Gateway URL
output "api_gateway_url" {
  value = aws_api_gateway_deployment.ai_wizard.invoke_url
}
