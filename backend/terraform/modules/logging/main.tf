# Shared logging infrastructure
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.environment}/api-logs"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Environment = var.environment
    Service     = "api-gateway"
  })
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.environment}/backend"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Environment = var.environment
    Service     = "lambda"
  })
}

# CloudWatch Log Group for Firehose
resource "aws_cloudwatch_log_group" "firehose_logs" {
  name              = "/aws/firehose/ai-wizard-logging-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Name        = "ai-wizard-logging-${var.environment}-firehose-logs"
    Environment = var.environment
    Service     = "logging"
  })
}

# OpenSearch domain for log aggregation
resource "aws_opensearch_domain" "logging" {
  domain_name    = "ai-wizard-logging-${var.environment}"
  engine_version = "OpenSearch_2.9"

  cluster_config {
    instance_type  = var.opensearch_instance_type
    instance_count = 1

    # Remove auto_tune_options as it's not supported in this context
    zone_awareness_enabled = false
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.opensearch_volume_size
    volume_type = "gp3"
  }

  encrypt_at_rest {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  node_to_node_encryption {
    enabled = true
  }

  vpc_options {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.opensearch.id]
  }

  tags = merge(var.common_tags, {
    Environment = var.environment
    Service     = "logging"
  })
}

# Kinesis Firehose for log delivery
resource "aws_kinesis_firehose_delivery_stream" "logging" {
  name        = "ai-wizard-logging-${var.environment}-stream"
  destination = "opensearch"

  opensearch_configuration {
    domain_arn = aws_opensearch_domain.logging.arn
    role_arn   = aws_iam_role.firehose.arn
    index_name = "logs"

    buffering_interval = 60

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.firehose_logs.name
      log_stream_name = "OpenSearchDelivery"
    }

    vpc_config {
      subnet_ids         = aws_subnet.private[*].id
      security_group_ids = [aws_security_group.opensearch.id]
      role_arn           = aws_iam_role.firehose_vpc.arn
    }

    # Required S3 backup configuration
    s3_configuration {
      role_arn   = aws_iam_role.firehose_s3.arn
      bucket_arn = aws_s3_bucket.firehose_backup.arn
      prefix     = "logs/raw/"

      buffering_size     = 5
      buffering_interval = 300
      compression_format = "GZIP"
    }
  }
}

# S3 bucket for Firehose backup
resource "aws_s3_bucket" "firehose_backup" {
  bucket = "ai-wizard-logging-${var.environment}-backup-${data.aws_caller_identity.current.account_id}"

  tags = merge(var.common_tags, {
    Environment = var.environment
    Service     = "logging"
  })
}

resource "aws_s3_bucket_versioning" "firehose_backup" {
  bucket = aws_s3_bucket.firehose_backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Log processor Lambda
resource "aws_lambda_function" "log_processor" {
  filename      = "${path.module}/lambda/log_processor.zip"
  function_name = "ai-wizard-logging-${var.environment}-log-processor"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      OPENSEARCH_DOMAIN = aws_opensearch_domain.logging.endpoint
      ENVIRONMENT       = var.environment
    }
  }

  tags = merge(var.common_tags, {
    Name        = "ai-wizard-logging-${var.environment}-log-processor"
    Environment = var.environment
    Service     = "logging"
  })
}

# CloudWatch subscription filters
resource "aws_cloudwatch_log_subscription_filter" "lambda_logs" {
  name            = "lambda-logs-filter"
  log_group_name  = aws_cloudwatch_log_group.lambda_logs.name
  filter_pattern  = ""
  destination_arn = aws_lambda_function.log_processor.arn
}

# Security group for OpenSearch
resource "aws_security_group" "opensearch" {
  name        = "ai-wizard-logging-${var.environment}-opensearch-sg"
  description = "Security group for OpenSearch domain"
  vpc_id      = aws_vpc.logging.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, {
    Environment = var.environment
    Service     = "logging"
  })
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# VPC Configuration
resource "aws_vpc" "logging" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.common_tags, {
    Name        = "ai-wizard-logging-${var.environment}-vpc"
    Environment = var.environment
    Service     = "logging"
  })
}

# Public subnets
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.logging.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-public-${var.availability_zones[count.index]}"
    Environment = var.environment
    Service     = "logging"
    Type        = "public"
  })
}

# Private subnets
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.logging.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-private-${var.availability_zones[count.index]}"
    Environment = var.environment
    Service     = "logging"
    Type        = "private"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "logging" {
  vpc_id = aws_vpc.logging.id

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-igw"
    Environment = var.environment
    Service     = "logging"
  })
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-nat-eip-${count.index + 1}"
    Environment = var.environment
    Service     = "logging"
  })
}

# NAT Gateways
resource "aws_nat_gateway" "logging" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-nat-${count.index + 1}"
    Environment = var.environment
    Service     = "logging"
  })

  depends_on = [aws_internet_gateway.logging]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.logging.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.logging.id
  }

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-public-rt"
    Environment = var.environment
    Service     = "logging"
  })
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.logging.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.logging[count.index].id
  }

  tags = merge(var.common_tags, {
    Name        = "${var.environment}-logging-private-rt-${count.index + 1}"
    Environment = var.environment
    Service     = "logging"
  })
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
