# Remove or comment out the aws_region line, as it will be provided by the GitHub variable
# aws_region         = "eu-west-1"

environment        = "prod"
vpc_cidr           = "10.0.0.0/16"
ecs_task_cpu       = 256
ecs_task_memory    = 512
domain_name        = "your-domain-name.com"
route53_zone_id    = "your-route53-zone-id"
ecr_image_tag      = "latest"

# The following variables should be set via environment variables or a secure secret management system
# postgres_db_username = "aiwizard"
# postgres_db_password = "your-secure-password"
# db_secret_key        = "your-secret-key"
# openai_api_key       = "your-openai-api-key"