import json
from mangum import Mangum
from app.main import app
import os
from app.utils.logging_config import logger

# Ensure environment variables are set
os.environ.setdefault('STAGE', 'dev')
os.environ.setdefault('ALLOWED_ORIGINS', '*')

# Create Mangum handler for AWS Lambda
mangum_handler = Mangum(app, lifespan="off")  # Disable lifespan events

def log_request_details(event):
    """Helper function to log detailed request information"""
    logger.info("=== Request Details ===")
    logger.info(f"Request Path: {event.get('path', 'No path')}")
    logger.info(f"HTTP Method: {event.get('httpMethod', 'No method')}")
    logger.info(f"Resource Path: {event.get('resource', 'No resource')}")
    logger.info(f"API Gateway ARN: {event.get('requestContext', {}).get('apiId', 'No API ID')}")
    logger.info(f"Stage: {event.get('requestContext', {}).get('stage', 'No stage')}")
    
    # Add specific logging for Authorization header
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization', 'No Authorization header')
    logger.info(f"Authorization Header Present: {'Authorization' in headers}")
    
    # Log other headers without sensitive info
    safe_headers = {
        k: v for k, v in headers.items() 
        if k.lower() not in ["authorization", "cookie"]
    }
    logger.info(f"Request Headers: {json.dumps(safe_headers, indent=2)}")
    logger.info("=====================")

def lambda_handler(event, context):
    """
    AWS Lambda handler function that wraps the FastAPI application.
    Uses Mangum to translate between AWS Lambda events and ASGI.
    """
    logger.info("Lambda function invoked")
    log_request_details(event)

    try:
        response = mangum_handler(event, context)
        logger.info(f"Response Status Code: {response.get('statusCode', 'No status code')}")
        return response

    except Exception as e:
        logger.error(f"Error handling request: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal Server Error", "details": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True
            }
        } 