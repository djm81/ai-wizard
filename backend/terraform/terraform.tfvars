# These variables need to be provided by GitHub variables with prefix TF_VAR_
# aws_account_id     = "123456789012"
# aws_region         = "your-region"
# domain_name        = "your-domain.com"
# route53_hosted_zone_id    = "your-route53-hosted-zone-id"

environment                   = "production"
dynamodb_table_name           = "ai-wizard-table"
lambda_function_name          = "ai-wizard-lambda"
frontend_bucket_name          = "ai-wizard-frontend-${aws_region}"
zappa_deployments_bucket_name = "ai-wizard-zappa-deployments-${aws_region}"
