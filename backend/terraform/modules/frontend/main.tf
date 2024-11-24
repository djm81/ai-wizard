terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
      configuration_aliases = [aws.assume_role, aws.assume_role_us_east_1]
    }
  }
}

# Frontend infrastructure resources
resource "aws_s3_bucket" "frontend" {
  provider = aws.assume_role
  bucket   = "${var.frontend_bucket_name}-${var.environment}"

  tags = merge(var.common_tags, {
    Name    = "${var.frontend_bucket_name}-${var.environment}"
    Service = "ai-wizard-frontend"
  })
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  provider                = aws.assume_role
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_acm_certificate" "frontend" {
  provider          = aws.assume_role_us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-frontend-cert"
    Service = "ai-wizard-frontend"
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  provider                          = aws.assume_role
  name                             = "frontend-${var.environment}-oac"
  description                      = "Origin Access Control for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                 = "always"
  signing_protocol                 = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  provider = aws.assume_role
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.frontend.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(var.common_tags, {
    Name    = "ai-wizard-frontend-cdn-${var.environment}"
    Service = "ai-wizard-frontend"
  })

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

resource "aws_route53_record" "frontend" {
  provider = aws.assume_role
  name     = var.domain_name
  type     = "A"
  zone_id  = var.route53_hosted_zone_id

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
} 