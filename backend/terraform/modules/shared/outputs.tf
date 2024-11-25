output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.ai_wizard.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.ai_wizard.arn
}

output "api_gateway_cloudwatch_role_arn" {
  description = "ARN of the API Gateway CloudWatch role"
  value       = aws_iam_role.api_gateway_cloudwatch.arn
}

output "api_gateway_cloudwatch_role_name" {
  description = "Name of the API Gateway CloudWatch role"
  value       = aws_iam_role.api_gateway_cloudwatch.name
}

output "api_gateway_service_linked_role_arn" {
  description = "ARN of the API Gateway service-linked role"
  value       = aws_iam_service_linked_role.apigw.arn
}
