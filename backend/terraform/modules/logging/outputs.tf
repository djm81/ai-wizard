output "opensearch_endpoint" {
  value       = aws_opensearch_domain.logging.endpoint
  description = "OpenSearch domain endpoint"
}

output "api_logs_group_arn" {
  value       = aws_cloudwatch_log_group.api_logs.arn
  description = "API Gateway CloudWatch log group ARN"
}

output "lambda_logs_group_arn" {
  value       = aws_cloudwatch_log_group.lambda_logs.arn
  description = "Lambda CloudWatch log group ARN"
}

output "log_processor_function_arn" {
  value       = aws_lambda_function.log_processor.arn
  description = "Log processor Lambda function ARN"
}

output "firehose_stream_arn" {
  value       = aws_kinesis_firehose_delivery_stream.logging.arn
  description = "Kinesis Firehose delivery stream ARN"
}

output "vpc_id" {
  description = "ID of the logging VPC"
  value       = aws_vpc.logging.id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.logging.cidr_block
}
