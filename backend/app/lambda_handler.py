"""lambda_handler module for AI Wizard backend."""

# Standard library imports
import json
import logging
from typing import Any, Dict

# Third party imports
from fastapi import HTTPException
from mangum import Mangum

# Local application imports
from app.main import app
from app.utils.logging_config import setup_logging

logger = logging.getLogger(__name__)
setup_logging()


def create_error_response(
    status_code: int,
    message: str,
    error_type: str,
    request_id: str,
    headers: Dict[str, str] = None,
) -> Dict[str, Any]:
    """Create standardized error response.

    Args:
        status_code: HTTP status code
        message: Error message
        error_type: Type of error
        request_id: Request correlation ID
        headers: Additional headers

    Returns:
        Formatted error response
    """
    error_body = {"error": {"type": error_type, "message": message, "request_id": request_id}}

    return {
        "statusCode": status_code,
        "body": json.dumps(error_body),
        "headers": {
            "Content-Type": "application/json",
            "X-Request-ID": request_id,
            **(headers or {}),
        },
    }


def log_request_details(event: Dict[str, Any]) -> str:
    """Log request details from event for debugging.

    Args:
        event: Lambda event

    Returns:
        Request ID for correlation
    """
    request_context = event.get("requestContext", {})
    request_id = request_context.get("requestId", "unknown")
    http = request_context.get("http", {})

    logger.info(
        "Request received",
        extra={"request_id": request_id, "method": http.get("method"), "path": http.get("path")},
    )

    return request_id


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
        # Log request and get correlation ID
        request_id = log_request_details(event)

        # Handle the request
        response = mangum_handler(event, context)

        # Add correlation ID to successful responses
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

    except ValueError as e:
        return create_error_response(
            status_code=400, message=str(e), error_type="validation_error", request_id=request_id
        )
    except HTTPException as e:
        return create_error_response(
            status_code=e.status_code,
            message=e.detail,
            error_type="http_error",
            request_id=request_id,
            headers=e.headers,
        )
    except (RuntimeError, KeyError, AttributeError) as e:  # Specific exceptions that could occur
        logger.error(
            "Runtime error in lambda handler",
            extra={
                "error": str(e),
                "error_type": type(e).__name__,
                "request_id": request_id,
                "event_path": event.get("path"),
                "event_method": event.get("requestContext", {}).get("http", {}).get("method"),
            },
            exc_info=True,
        )
        return create_error_response(
            status_code=500,
            message="Internal server error",
            error_type="internal_error",
            request_id=request_id,
        )
    except Exception as e:  # pylint: disable=broad-except
        # Keep broad exception as last resort safety net, but document why
        logger.critical(
            "Unhandled error in lambda handler",
            extra={
                "error": str(e),
                "error_type": type(e).__name__,
                "request_id": request_id,
                "event_path": event.get("path"),
                "event_method": event.get("requestContext", {}).get("http", {}).get("method"),
            },
            exc_info=True,
        )
        return create_error_response(
            status_code=500,
            message="Internal server error",
            error_type="internal_error",
            request_id=request_id,
        )
