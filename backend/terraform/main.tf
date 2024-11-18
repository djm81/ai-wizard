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

# IAM role for Lambda
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

# Add explicit CloudWatch Logs policy for Lambda
resource "aws_iam_role_policy" "lambda_cloudwatch" {
  provider = aws.assume_role
  name     = "lambda-cloudwatch-policy-${var.environment}"
  role     = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2:*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2"
        ]
      }
    ]
  })
}

# Create or import CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  provider          = aws.assume_role
  name              = "/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2"
  retention_in_days = 14

  tags = merge(local.common_tags, {
    Name    = "/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = false
    ignore_changes = [
      tags,
      name,
      retention_in_days,
      # Add kms_key_id if you're using encryption
      kms_key_id
    ]
  }
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

# Lambda Function
resource "aws_lambda_function" "api_v2" {
  provider         = aws.assume_role
  filename         = "${path.module}/lambda/lambda_package.zip"
  function_name    = "${var.lambda_function_name_prefix}-${var.environment}-v2"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "app.lambda_handler.mangum_handler"
  runtime         = "python3.12"
  source_code_hash = var.lambda_source_code_hash
  publish         = true  # Enable versioning

  environment {
    variables = {
      STAGE = var.environment
      DATABASE_URL = var.database_url
      ALLOWED_ORIGINS = "https://${var.domain_name},https://api.${var.domain_name}"
    }
  }

  tags = merge(local.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-${var.environment}-v2"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    ignore_changes = [
      # Ignore changes when app package is deployed
      filename,
      source_code_hash,
      handler,
      # Still allow environment updates
      environment,
    ]
    create_before_destroy = true
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs
  ]
}

# Add Lambda alias for stable deployments
resource "aws_lambda_alias" "api_alias_v2" {
  provider         = aws.assume_role
  name             = "${var.environment}-v2"
  description      = "Alias for ${var.environment} environment (v2)"
  function_name    = aws_lambda_function.api_v2.function_name
  function_version = aws_lambda_function.api_v2.version

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway configuration
resource "aws_apigatewayv2_api" "api" {
  provider      = aws.assume_role
  name          = "${var.lambda_function_name_prefix}-${var.environment}"
  protocol_type = "HTTP"
  
  # Use OpenAPI specification
  body = file("${path.module}/api/specification.yaml")
  
  # Ensure routes are created from the OpenAPI spec
  route_selection_expression = "$request.method $request.path"
  
  # Add target Lambda integration
  target = aws_lambda_alias.api_alias_v2.invoke_arn

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "https://api.${var.domain_name}"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"]
    allow_headers = [
      "Content-Type",
      "Authorization",
      "X-Amz-Date",
      "X-Api-Key",
      "X-Amz-Security-Token",
      "X-Requested-With"
    ]
    expose_headers = [
      "Content-Type",
      "Authorization"
    ]
    max_age = 300
    allow_credentials = true
  }

  depends_on = [
    aws_lambda_alias.api_alias_v2
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-api-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Integration needs to be created before routes
resource "aws_apigatewayv2_integration" "lambda" {
  provider          = aws.assume_role
  api_id            = aws_apigatewayv2_api.api.id
  integration_type  = "AWS_PROXY"
  integration_uri   = aws_lambda_alias.api_alias_v2.invoke_arn
  integration_method = "POST"

  # depends_on = [
  #   aws_apigatewayv2_api.api,
  #   aws_lambda_alias.api_alias_v2
  # ]

  lifecycle {
    create_before_destroy = true
  }
}

# Single stage definition with all configurations
resource "aws_apigatewayv2_stage" "lambda" {
  provider = aws.assume_role
  api_id = aws_apigatewayv2_api.api.id
  name   = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip            = "$context.identity.sourceIp"
      requestTime   = "$context.requestTime"
      httpMethod    = "$context.httpMethod"
      routeKey      = "$context.routeKey"
      status        = "$context.status"
      protocol      = "$context.protocol"
      responseLength = "$context.responseLength"
      path          = "$context.path"
      authorization = "$context.authorizer.error"
    })
  }

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_burst_limit  = 100
    throttling_rate_limit   = 50
  }

  # Add stage variables
  stage_variables = {
    lambdaAlias = var.environment
  }

  # depends_on = [
  #   aws_apigatewayv2_api.api,
  #   aws_apigatewayv2_integration.lambda,
  #   aws_cloudwatch_log_group.api_gw,
  #   aws_iam_role.api_gateway_cloudwatch
  # ]

  lifecycle {
    create_before_destroy = true
    # Ensure API mappings are removed first
    replace_triggered_by = [
      aws_apigatewayv2_api.api
    ]
  }

  tags = merge(local.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-api-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Single API mapping definition
resource "aws_apigatewayv2_api_mapping" "api" {
  provider    = aws.assume_role
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.lambda.id

  # depends_on = [
  #   aws_apigatewayv2_stage.lambda,
  #   aws_apigatewayv2_domain_name.api
  # ]

  lifecycle {
    create_before_destroy = true
    # Add explicit dependency for cleanup
    replace_triggered_by = [
      aws_apigatewayv2_stage.lambda
    ]
  }
}

# Add a catch-all route
resource "aws_apigatewayv2_route" "any" {
  provider  = aws.assume_role
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Add explicit root route
resource "aws_apigatewayv2_route" "root" {
  provider  = aws.assume_role
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Also verify the Lambda execution role has necessary permissions
resource "aws_iam_role_policy" "lambda_execution" {
  provider = aws.assume_role
  name     = "lambda-execution-policy-${var.environment}"
  role     = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:CreateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:DescribeLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:UpdateLogDelivery",
          "lambda:InvokeFunction"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}:*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}:*",
          "${aws_lambda_function.api_v2.arn}:*"
        ]
      }
    ]
  })
}

# Add IAM policy for API Gateway logging with expanded permissions
resource "aws_iam_role_policy" "api_gateway_logging" {
  provider = aws.assume_role
  name     = "api-gateway-logging-policy-${var.environment}"
  role     = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:DescribeLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:UpdateLogDelivery",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:GetLogDelivery",
          "logs:GetLogRecord",
          "logs:GetLogGroupFields",
          "logs:GetQueryResults"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}:*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:*"
        ]
      }
    ]
  })
}

# Add CloudWatch log group for API Gateway
resource "aws_cloudwatch_log_group" "api_gw" {
  provider          = aws.assume_role
  name              = "/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}"
  retention_in_days = 14

  tags = merge(local.common_tags, {
    Name    = "/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = false
    ignore_changes = [
      tags,
      name,
      retention_in_days,
      # Add kms_key_id if you're using encryption
      kms_key_id
    ]
  }
}

# Update Lambda permission for API Gateway v2
resource "aws_lambda_permission" "api_gw" {
  provider      = aws.assume_role
  statement_id  = "AllowExecutionFromAPIGatewayV2"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_v2.function_name
  qualifier     = aws_lambda_alias.api_alias_v2.name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# Add HTTP API domain name
resource "aws_apigatewayv2_domain_name" "api" {
  provider    = aws.assume_role
  domain_name = "api.${var.domain_name}"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.backend_api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [
    aws_acm_certificate_validation.backend_api
  ]
}

# Update Route53 record for API
resource "aws_route53_record" "backend_api" {
  provider = aws.assume_role
  name     = aws_apigatewayv2_domain_name.api.domain_name
  type     = "A"
  zone_id  = var.route53_hosted_zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Create service-linked role for API Gateway logging
resource "aws_iam_service_linked_role" "apigw" {
  provider           = aws.assume_role
  aws_service_name   = "ops.apigateway.amazonaws.com"
  description        = "Service-linked role for API Gateway"

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      description,
      tags,
      custom_suffix,
      id,
      unique_id,
      path,
      arn
    ]
    create_before_destroy = false
  }
}

# Add explicit policy attachment for API Gateway logging
resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  provider   = aws.assume_role
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Update API Gateway account settings to enable CloudWatch logging
resource "aws_api_gateway_account" "main" {
  provider = aws.assume_role
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn

  depends_on = [
    aws_iam_role.api_gateway_cloudwatch,
    aws_iam_role_policy_attachment.api_gateway_cloudwatch_managed
  ]
}

# Create a dedicated role for API Gateway CloudWatch logging
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
    Name    = "api-gateway-cloudwatch-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Attach AWS managed policy for API Gateway CloudWatch permissions
resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch_managed" {
  provider   = aws.assume_role
  role       = aws_iam_role.api_gateway_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Add Route53 record for API Gateway custom domain
resource "aws_route53_record" "api" {
  provider = aws.assume_role
  name     = "api.${var.domain_name}"
  type     = "A"
  zone_id  = var.route53_hosted_zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
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

# Outputs
output "dynamodb_table_name" {
  value = aws_dynamodb_table.ai_wizard.name
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}

output "cloudfront_distribution_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "website_url" {
  value = "https://${var.domain_name}"
}

output "domain_name" {
  value = var.domain_name
}

output "api_domain" {
  value = aws_apigatewayv2_domain_name.api.domain_name
}

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "api_gateway_stage_url" {
  description = "API Gateway stage invoke URL"
  value       = "${aws_apigatewayv2_api.api.api_endpoint}/${var.environment}"
}

# Add missing output for Lambda function
output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api_v2.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api_v2.arn
}

