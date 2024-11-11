import json
import logging
import traceback
from mangum import Mangum
from app.main import app
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger()

# Create Mangum handler for AWS Lambda
handler = Mangum(app, lifespan="off")

def log_event_details(event: dict) -> None:
    """Log relevant details from the Lambda event"""
    # Log basic event info
    logger.info("Event type: %s", event.get("requestContext", {}).get("eventType"))
    logger.info("HTTP method: %s", event.get("requestContext", {}).get("http", {}).get("method"))
    logger.info("Path: %s", event.get("rawPath"))
    
    # Log headers (excluding sensitive information)
    headers = event.get("headers", {})
    safe_headers = {
        k: v for k, v in headers.items() 
        if k.lower() not in ["authorization", "cookie"]
    }
    logger.info("Headers: %s", json.dumps(safe_headers))
    
    # Log query parameters if present
    if "queryStringParameters" in event:
        logger.info("Query parameters: %s", json.dumps(event.get("queryStringParameters")))

def lambda_handler(event: dict, context: object) -> dict:
    """
    AWS Lambda handler function that wraps the FastAPI application.
    Uses Mangum to translate between AWS Lambda events and ASGI.
    """
    logger.info("Raw event received: %s", json.dumps(event, indent=2))
    logger.info("Lambda function invoked")
    logger.info("Function name: %s", context.function_name)
    logger.info("Request ID: %s", context.aws_request_id)
    logger.info("Memory limit: %s MB", context.memory_limit_in_mb)
    logger.info("Time remaining: %s ms", context.get_remaining_time_in_millis())

    try:
        # Log event details
        log_event_details(event)
        
        # Handle AWS Lambda@Edge events
        if event.get("Records", [{}])[0].get("cf", {}).get("config", {}).get("distributionId"):
            logger.info("Lambda@Edge event detected")
            distribution_id = event["Records"][0]["cf"]["config"]["distributionId"]
            logger.info("Distribution ID: %s", distribution_id)
            # Add Lambda@Edge specific handling if needed
            pass

        # Use Mangum to handle the event
        logger.debug("Processing request with Mangum handler")
        response = handler(event, context)
        
        # Log response status
        status_code = response.get("statusCode", 500)
        logger.info("Request completed with status code: %d", status_code)
        
        return response

    except Exception as e:
        # Log the full exception traceback
        logger.error("Error handling request: %s", str(e))
        logger.error("Traceback: %s", traceback.format_exc())
        
        # Return a proper error response
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": "Internal Server Error",
                "message": str(e) if settings.DEBUG else "An unexpected error occurred"
            }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": settings.ALLOWED_ORIGINS,
                "Access-Control-Allow-Credentials": "true"
            }
        } 