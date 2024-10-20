# Remove or comment out the aws_region line, as it will be provided by the GitHub variable
# aws_account_id     = "123456789012"
# aws_region         = "your-region"

environment        = "production"
domain_name        = "your-domain.com"
route53_zone_id    = "your-route53-zone-id"
ecr_image_tag      = "latest"

# The following variables should be set via environment variables or a secure secret management system
# openai_api_key       = "your-openai-api-key"

zappa_deployment_bucket_name = "ai-wizard-zappa-deployments"
dynamodb_table_name          = "ai-wizard-table"
lambda_function_name         = "ai-wizard-lambda"
frontend_bucket_name         = "ai-wizard-frontend"
