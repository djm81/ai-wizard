# AWS Account Configuration
aws_region     = "eu-west-1"
aws_account_id = "123456789012" # Will be overridden by pipeline

# Domain Configuration
domain_name            = "ai-wizard.apps.noldmedia.com"
route53_hosted_zone_id = "Z0123456789ABCDEF" # Will be overridden by pipeline

# Resource Naming
frontend_bucket_name        = "ai-wizard-frontend"
lambda_function_name_prefix = "ai-wizard-backend"
dynamodb_table_name         = "ai-wizard-table"

# Lambda Configuration
database_url            = "postgresql://user:pass@host:5432/dbname" # Will be overridden by pipeline
lambda_source_code_hash = "base64_encoded_hash"                     # Will be overridden by pipeline
