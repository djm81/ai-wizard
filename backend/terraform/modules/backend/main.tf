terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.72"
      configuration_aliases = [aws.assume_role]
    }
  }
}

# Backend infrastructure resources
resource "aws_lambda_function" "api_v2" {
  provider         = aws.assume_role
  filename         = "${path.module}/lambda/lambda_package.zip"
  function_name    = "${var.lambda_function_name_prefix}-${var.environment}-v2"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "app.lambda_handler.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = var.lambda_source_code_hash
  publish          = true
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout

  environment {
    variables = {
      STAGE           = var.environment
      DATABASE_URL    = var.database_url
      ALLOWED_ORIGINS = "https://${var.domain_name},https://api.${var.domain_name}"
      ENVIRONMENT     = var.environment
    }
  }

  tags = merge(var.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-${var.environment}-v2"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs
  ]
}

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

resource "aws_apigatewayv2_api" "api" {
  provider      = aws.assume_role
  name          = "${var.lambda_function_name_prefix}-${var.environment}"
  protocol_type = "HTTP"

  body = replace(
    replace(
      file("${path.module}/api/specification.yaml"),
      "title: ai-wizard-backend-api",
      "title: ai-wizard-backend-api-${var.environment}"
    ),
    "$${lambda_uri}",
    aws_lambda_alias.api_alias_v2.invoke_arn
  )

  route_selection_expression = "$request.method $request.path"

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
      "X-Requested-With",
      "Origin",
      "Accept",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ]
    expose_headers = [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ]
    max_age           = 300
    allow_credentials = true
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.common_tags, {
    Name    = "${var.lambda_function_name_prefix}-api-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  provider          = aws.assume_role
  name              = "/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2"
  retention_in_days = var.cloudwatch_retention_days

  tags = merge(var.common_tags, {
    Name    = "/aws/lambda/${var.lambda_function_name_prefix}-${var.environment}-v2"
    Service = "ai-wizard-backend"
  })
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gw" {
  provider          = aws.assume_role
  name              = "/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}"
  retention_in_days = var.cloudwatch_retention_days

  tags = merge(var.common_tags, {
    Name    = "/aws/api_gw/${var.lambda_function_name_prefix}-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# IAM role for Lambda execution
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

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-lambda-exec-role-${var.environment}"
    Service = "ai-wizard-backend"
  })
}

# Lambda CloudWatch policy
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
          "${aws_cloudwatch_log_group.lambda_logs.arn}:*",
          aws_cloudwatch_log_group.lambda_logs.arn
        ]
      }
    ]
  })
}

# API Gateway integration
resource "aws_apigatewayv2_integration" "lambda" {
  provider           = aws.assume_role
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_alias.api_alias_v2.invoke_arn
  integration_method = "POST"
  description        = "Lambda integration"

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway deployment
resource "aws_apigatewayv2_deployment" "api" {
  provider    = aws.assume_role
  api_id      = aws_apigatewayv2_api.api.id
  description = "Deployment for ${var.environment}"

  triggers = {
    redeployment = sha1(jsonencode([
      aws_apigatewayv2_integration.lambda.id,
      replace(
        replace(
          file("${path.module}/api/specification.yaml"),
          "title: ai-wizard-backend-api",
          "title: ai-wizard-backend-api-${var.environment}"
        ),
        "$${lambda_uri}",
        aws_lambda_alias.api_alias_v2.invoke_arn
      )
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_api.api,
    aws_apigatewayv2_integration.lambda
  ]
}

# API Gateway stage with logging
resource "aws_apigatewayv2_stage" "lambda" {
  provider    = aws.assume_role
  api_id      = aws_apigatewayv2_api.api.id
  name        = var.environment
  auto_deploy = true

  stage_variables = {
    lambdaAlias = "${var.environment}-v2"
  }

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_burst_limit   = var.api_gateway_throttling_burst_limit
    throttling_rate_limit    = var.api_gateway_throttling_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId            = "$context.requestId"
      sourceIp             = "$context.identity.sourceIp"
      requestTime          = "$context.requestTime"
      protocol             = "$context.protocol"
      httpMethod           = "$context.httpMethod"
      resourcePath         = "$context.resourcePath"
      routeKey             = "$context.routeKey"
      status               = "$context.status"
      responseLength       = "$context.responseLength"
      integrationError     = "$context.integration.error"
      integrationStatus    = "$context.integration.status"
      integrationLatency   = "$context.integration.latency"
      integrationRequestId = "$context.integration.requestId"
      xrayTraceId          = "$context.xrayTraceId"
      responseLatency      = "$context.responseLatency"
      authorizer           = "$context.authorizer.error"
      authorizerLatency    = "$context.authorizer.latency"
      authorizerStatus     = "$context.authorizer.status"
    })
  }

  depends_on = [
    aws_cloudwatch_log_group.api_gw
  ]
}

# API Gateway domain name with base path mapping
resource "aws_apigatewayv2_api_mapping" "api" {
  provider    = aws.assume_role
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.lambda.id
  # Add this to remove stage prefix from path
  api_mapping_key = ""
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  provider      = aws.assume_role
  statement_id  = "AllowExecutionFromAPIGatewayV2"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_v2.function_name
  qualifier     = aws_lambda_alias.api_alias_v2.name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# API Gateway domain name
resource "aws_apigatewayv2_domain_name" "api" {
  provider    = aws.assume_role
  domain_name = "api.${var.domain_name}"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.backend_api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

# Backend API certificate
resource "aws_acm_certificate" "backend_api" {
  provider          = aws.assume_role
  domain_name       = "api.${var.domain_name}"
  validation_method = "DNS"

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-backend-api-cert-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Route53 record for API certificate validation
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

# Route53 record for API
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
