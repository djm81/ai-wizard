# Frontend outputs
output "website_url" {
  description = "Frontend website URL"
  value       = module.frontend.website_url
}

output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = module.frontend.cloudfront_distribution_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.frontend.cloudfront_distribution_id
}

# Backend outputs
output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.backend.api_gateway_url
}

output "api_gateway_stage_url" {
  description = "API Gateway stage invoke URL"
  value       = module.backend.api_gateway_stage_url
}

output "api_domain" {
  description = "Custom domain name for the API"
  value       = module.backend.api_domain
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.backend.lambda_function_name
}

output "lambda_function_id" {
  description = "ID of the Lambda function"
  value       = module.backend.lambda_function_id
}

# Shared outputs
output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.shared.dynamodb_table_name
}

output "api_gateway_cloudwatch_role_arn" {
  description = "ARN of the API Gateway CloudWatch role"
  value       = module.shared.api_gateway_cloudwatch_role_arn
}