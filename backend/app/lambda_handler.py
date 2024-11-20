"""lambda_handler module for AI Wizard backend."""

import asyncio
import json
import logging
from typing import Any, Dict, Optional

from app.main import app
from app.utils.logging_config import setup_logging
from mangum import Mangum

logger = logging.getLogger(__name__)
setup_logging()


def log_request_details(event: Dict[str, Any]) -> None:
    """Log request details from event for debugging."""
    request_context = event.get("requestContext", {})
    http = request_context.get("http", {})
    headers = event.get("headers", {})

    # Log request details
    logger.info("Request: %s %s", http.get("method"), http.get("path"))

    # Log headers for debugging (excluding sensitive data)
    safe_headers = {
        k: v for k, v in headers.items() if k.lower() not in {"authorization", "cookie"}
    }
    logger.debug("Headers: %s", safe_headers)


mangum_handler = Mangum(app)


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda handler function with detailed logging.

    Args:
        event: AWS Lambda event
        context: AWS Lambda context

    Returns:
        API Gateway response
    """
    try:
        # Log request details
        log_request_details(event)

        # Handle the request
        return mangum_handler(event, context)

    except Exception as e:
        # Log error details
        logger.error("Lambda handler error: %s", str(e), exc_info=True)

        # Return error response
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": "Internal server error",
                    "detail": str(e) if app.debug else None,
                }
            ),
        }
