output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api_v2.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api_v2.arn
}

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "api_gateway_stage_url" {
  description = "API Gateway stage invoke URL"
  value       = "${aws_apigatewayv2_api.api.api_endpoint}/${var.environment}"
}

output "api_domain" {
  description = "Custom domain name for the API"
  value       = aws_apigatewayv2_domain_name.api.domain_name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_exec.arn
}

output "lambda_log_group_name" {
  description = "Name of the Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "api_gateway_log_group_name" {
  description = "Name of the API Gateway CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gw.name
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.api.id
}

output "api_gateway_stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_apigatewayv2_stage.lambda.name
}

output "api_certificate_arn" {
  description = "ARN of the API Gateway certificate"
  value       = aws_acm_certificate.backend_api.arn
}

output "api_certificate_validation_record_fqdns" {
  description = "List of FQDNs for the API certificate validation records"
  value       = [for record in aws_route53_record.backend_api_cert_validation : record.fqdn]
}
