"""lambda_handler module for AI Wizard backend."""

import json
import logging
from typing import Any, Dict

from fastapi import HTTPException
from mangum import Mangum

from app.core.config import settings
from app.core.logging_config import logger, setup_logging
from app.main import app

# Initialize logging once at module load
setup_logging()

# Ensure we add the base path if we are running in Lambda
if settings.IS_LAMBDA:
    mangum_handler = Mangum(app, api_gateway_base_path=f"/{settings.ENVIRONMENT}")
else:
    mangum_handler = Mangum(app)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda handler to interface with API Gateway using Mangum.

    Args:
        event: AWS Lambda event from API Gateway
        context: AWS Lambda context

    Returns:
        Dict[str, Any]: Response dictionary for API Gateway
    """
    try:
        logger.info("event: %s", json.dumps(event, default=str))
        logger.info("context: %s", json.dumps(context, default=str))

        # Get stage from different possible locations
        request_context = event.get('requestContext', {})
        stage = request_context.get('stage', '')

        # If stage is not found in requestContext, try to extract from path
        if not stage and 'path' in event:
            path_parts = event['path'].split('/')
            if len(path_parts) > 1 and path_parts[1]:  # Check if path has segments
                stage = path_parts[1]  # Extract stage from path (e.g. /dev/projects -> dev)

        # Note: Since Mangum is already instantiated, avoid re-instantiating it here
        response = mangum_handler(event, context)

        # Add correlation ID to successful responses
        request_id = request_context.get("requestId", "unknown")

        if isinstance(response.get("body"), str):
            try:
                body = json.loads(response["body"])
                if isinstance(body, dict):
                    body["request_id"] = request_id
                    response["body"] = json.dumps(body)
            except json.JSONDecodeError:
                pass

        response["headers"] = {**(response.get("headers", {})), "X-Request-ID": request_id}

        return response

    except HTTPException as e:
        return {
            "statusCode": e.status_code,
            "body": json.dumps({"error": e.detail}),
            "headers": {
                "Content-Type": "application/json",
                "X-Request-ID": event.get("requestContext", {}).get("requestId", "unknown"),
                **e.headers,
            },
        }
    except Exception as e:
        logger.error("Unhandled exception in lambda_handler", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"}),
            "headers": {
                "Content-Type": "application/json",
                "X-Request-ID": event.get("requestContext", {}).get("requestId", "unknown"),
            },
        }
