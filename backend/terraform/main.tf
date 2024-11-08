terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
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
  bucket   = "${var.zappa_deployments_bucket_name}-${var.environment}"

  tags = merge(local.common_tags, {
    Name = "${var.zappa_deployments_bucket_name}-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# DynamoDB table
resource "aws_dynamodb_table" "ai_wizard" {
  provider         = aws.assume_role
  name             = "${var.dynamodb_table_name}-${var.environment}"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  tags = merge(local.common_tags, {
    Name = "${var.dynamodb_table_name}-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# IAM role for Lambda (to be used by Zappa)
resource "aws_iam_role" "lambda_exec" {
  provider = aws.assume_role
  name     = "ai-wizard-lambda-exec-role-${var.environment}"

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
    Name = "ai-wizard-lambda-exec-role-${var.environment}"
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
  bucket   = "${var.frontend_bucket_name}-${var.environment}"

  tags = merge(local.common_tags, {
    Name = "${var.frontend_bucket_name}-${var.environment}"
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
        Sid       = "AllowCloudFrontOAI"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
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
    Name = "ai-wizard-frontend-cdn-${var.environment}"
    Service = "ai-wizard-frontend"
  })

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
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
  name        = "ai-wizard-backend-api-${var.environment}"
  description = "AI Wizard Backend API (${var.environment})"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-backend-api-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Lambda Function
resource "aws_lambda_function" "api" {
  filename         = "${path.module}/lambda/lambda_package.zip"
  function_name    = "${var.lambda_function_name_prefix}-${var.environment}"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "app.lambda_handler.handler"
  runtime         = "python3.12"
  source_code_hash = var.lambda_source_code_hash
  publish         = true  # Enable versioning

  environment {
    variables = {
      STAGE = var.environment
      DATABASE_URL = var.database_url
    }
  }

  tags = merge(local.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    # ignore_changes = [
    #   # Ignore changes to tags, etc
    #   tags,
    #   # Don't recreate on code updates
    #   filename,
    #   # Allow updates through code hash
    #   source_code_hash,
    # ]
    create_before_destroy = true
  }
}

# Add Lambda alias for stable deployments
resource "aws_lambda_alias" "api_alias" {
  name             = var.environment
  description      = "Alias for ${var.environment} environment"
  function_name    = aws_lambda_function.api.function_name
  function_version = aws_lambda_function.api.version

  lifecycle {
    create_before_destroy = true
  }
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

# Update API Gateway Integration
resource "aws_api_gateway_integration" "backend_lambda" {
  provider                = aws.assume_role
  rest_api_id             = aws_api_gateway_rest_api.ai_wizard.id
  resource_id             = aws_api_gateway_method.proxy.resource_id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_alias.invoke_arn
}

# Update Lambda permission
resource "aws_lambda_permission" "backend_apigw" {
  provider      = aws.assume_role
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  qualifier     = aws_lambda_alias.api_alias.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.ai_wizard.execution_arn}/*/*"
}

# Update API Gateway Deployment dependency
resource "aws_api_gateway_deployment" "ai_wizard" {
  provider  = aws.assume_role
  depends_on = [
    aws_api_gateway_integration.backend_lambda,
    aws_api_gateway_integration.root
  ]

  rest_api_id = aws_api_gateway_rest_api.ai_wizard.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

# Output the API Gateway URL
output "api_gateway_url" {
  value = aws_api_gateway_deployment.ai_wizard.invoke_url
}

# API Gateway Custom Domain Certificate (in the same region as API Gateway)
resource "aws_acm_certificate" "backend_api" {
  provider          = aws.assume_role
  domain_name       = "api.${var.domain_name}"
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name    = "ai-wizard-backend-api-cert-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Route 53 record for API certificate validation
resource "aws_route53_record" "backend_api_cert_validation" {
  provider = aws.assume_role
  for_each = {
    for dvo in aws_acm_certificate.backend_api.domain_validation_options : dvo.domain_name => {
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
resource "aws_acm_certificate_validation" "backend_api" {
  provider                = aws.assume_role
  certificate_arn         = aws_acm_certificate.backend_api.arn
  validation_record_fqdns = [for record in aws_route53_record.backend_api_cert_validation : record.fqdn]
}

# API Gateway Custom Domain
resource "aws_api_gateway_domain_name" "backend_api_domain" {
  provider                 = aws.assume_role
  domain_name             = "api.${var.domain_name}"
  regional_certificate_arn = aws_acm_certificate.backend_api.arn
  security_policy         = "TLS_1_2"
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = merge(local.common_tags, {
    Name    = "ai-wizard-backend-api-domain-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# API Gateway Base Path Mapping
resource "aws_api_gateway_base_path_mapping" "backend_api" {
  provider    = aws.assume_role
  api_id      = aws_api_gateway_rest_api.ai_wizard.id
  stage_name  = aws_api_gateway_deployment.ai_wizard.stage_name
  domain_name = aws_api_gateway_domain_name.backend_api_domain.domain_name
}

# Route 53 record for API Gateway custom domain
resource "aws_route53_record" "backend_api" {
  provider = aws.assume_role
  name     = aws_api_gateway_domain_name.backend_api_domain.domain_name
  type     = "A"
  zone_id  = var.route53_hosted_zone_id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.backend_api_domain.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.backend_api_domain.regional_zone_id
  }
}

# Update API Gateway settings to enforce HTTPS
resource "aws_api_gateway_method_settings" "all" {
  provider    = aws.assume_role
  rest_api_id = aws_api_gateway_rest_api.ai_wizard.id
  stage_name  = aws_api_gateway_deployment.ai_wizard.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = true
    logging_level         = "INFO"
    data_trace_enabled    = true
    throttling_burst_limit = 5000
    throttling_rate_limit  = 10000
  }
}

# Create IAM role for API Gateway CloudWatch logging
resource "aws_iam_role" "api_gateway_cloudwatch" {
  provider = aws.assume_role
  name     = "api-gateway-cloudwatch-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name    = "api-gateway-cloudwatch-role-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Attach CloudWatch policy to the IAM role
resource "aws_iam_role_policy" "api_gateway_cloudwatch" {
  provider = aws.assume_role
  name     = "api-gateway-cloudwatch-policy-${var.environment}"
  role     = aws_iam_role.api_gateway_cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Set up API Gateway account settings for CloudWatch
resource "aws_api_gateway_account" "main" {
  provider         = aws.assume_role
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

output "domain_name" {
  value = var.domain_name
}

output "api_domain" {
  value = aws_api_gateway_domain_name.backend_api_domain.domain_name
}

# Add root method
resource "aws_api_gateway_method" "root" {
  provider      = aws.assume_role
  rest_api_id   = aws_api_gateway_rest_api.ai_wizard.id
  resource_id   = aws_api_gateway_rest_api.ai_wizard.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Add root integration
resource "aws_api_gateway_integration" "root" {
  provider                = aws.assume_role
  rest_api_id             = aws_api_gateway_rest_api.ai_wizard.id
  resource_id             = aws_api_gateway_rest_api.ai_wizard.root_resource_id
  http_method             = aws_api_gateway_method.root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_alias.invoke_arn
}

