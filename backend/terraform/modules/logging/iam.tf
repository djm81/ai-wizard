# IAM role for Kinesis Firehose
resource "aws_iam_role" "firehose" {
  name = "ai-wizard-logging-${var.environment}-firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "firehose.amazonaws.com"
      }
    }]
  })

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-logging-${var.environment}-firehose-role"
    Service = "logging"
  })
}

# IAM role for Firehose S3 backup
resource "aws_iam_role" "firehose_s3" {
  name = "ai-wizard-logging-${var.environment}-firehose-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "firehose.amazonaws.com"
      }
    }]
  })

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-logging-${var.environment}-firehose-s3-role"
    Service = "logging"
  })
}

# IAM role for Firehose VPC access
resource "aws_iam_role" "firehose_vpc" {
  name = "ai-wizard-logging-${var.environment}-firehose-vpc-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "firehose.amazonaws.com"
      }
    }]
  })

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-logging-${var.environment}-firehose-vpc-role"
    Service = "logging"
  })
}

# IAM role for Log Processor Lambda
resource "aws_iam_role" "lambda_role" {
  name = "ai-wizard-logging-${var.environment}-log-processor-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-logging-${var.environment}-log-processor-role"
    Service = "logging"
  })
}

# Firehose OpenSearch policy
resource "aws_iam_role_policy" "firehose_opensearch" {
  name = "opensearch-policy"
  role = aws_iam_role.firehose.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "es:DescribeDomain",
          "es:DescribeDomains",
          "es:DescribeDomainConfig",
          "es:ESHttpPost",
          "es:ESHttpPut",
          "es:ESHttpGet"
        ]
        Resource = [
          aws_opensearch_domain.logging.arn,
          "${aws_opensearch_domain.logging.arn}/*"
        ]
      }
    ]
  })
}

# Firehose CloudWatch policy
resource "aws_iam_role_policy" "firehose_cloudwatch" {
  name = "cloudwatch-policy"
  role = aws_iam_role.firehose.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "${aws_cloudwatch_log_group.firehose_logs.arn}:*"
        ]
      }
    ]
  })
}

# Firehose S3 backup policy
resource "aws_iam_role_policy" "firehose_s3" {
  name = "s3-policy"
  role = aws_iam_role.firehose_s3.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:AbortMultipartUpload",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.firehose_backup.arn,
          "${aws_s3_bucket.firehose_backup.arn}/*"
        ]
      }
    ]
  })
}

# Firehose VPC policy
resource "aws_iam_role_policy" "firehose_vpc" {
  name = "vpc-policy"
  role = aws_iam_role.firehose_vpc.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda CloudWatch policy
resource "aws_iam_role_policy" "lambda_cloudwatch" {
  name = "cloudwatch-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:*:*:*"
        ]
      }
    ]
  })
}

# Lambda OpenSearch policy
resource "aws_iam_role_policy" "lambda_opensearch" {
  name = "opensearch-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "es:ESHttpPost",
          "es:ESHttpPut",
          "es:ESHttpGet"
        ]
        Resource = [
          aws_opensearch_domain.logging.arn,
          "${aws_opensearch_domain.logging.arn}/*"
        ]
      }
    ]
  })
}
