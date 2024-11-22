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

  tags = merge(var.common_tags, {
    Name    = "${var.dynamodb_table_name}-${var.environment}"
    Service = "ai-wizard-backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# API Gateway CloudWatch role
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

  tags = merge(var.common_tags, {
    Name    = "api-gateway-cloudwatch-${var.environment}"
    Service = "ai-wizard-shared"
  })
}

# API Gateway CloudWatch policy attachment
resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch_managed" {
  provider   = aws.assume_role
  role       = aws_iam_role.api_gateway_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Service-linked role for API Gateway
resource "aws_iam_service_linked_role" "apigw" {
  provider         = aws.assume_role
  aws_service_name = "ops.apigateway.amazonaws.com"
  description      = "Service-linked role for API Gateway"

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

# API Gateway account settings
resource "aws_api_gateway_account" "main" {
  provider            = aws.assume_role
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
} 