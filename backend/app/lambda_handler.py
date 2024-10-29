import json
from mangum import Mangum
from app.main import app

# Create Mangum handler for AWS Lambda
handler = Mangum(app)

def lambda_handler(event, context):
    """
    AWS Lambda handler function that wraps the FastAPI application.
    Uses Mangum to translate between AWS Lambda events and ASGI.
    """
    try:
        # Handle AWS Lambda@Edge events if needed
        if event.get("Records", [{}])[0].get("cf", {}).get("config", {}).get("distributionId"):
            print("Lambda@Edge event detected")
            # Add Lambda@Edge specific handling if needed
            pass

        # Use Mangum to handle the event
        response = handler(event, context)
        return response

    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal Server Error"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  # Configure as needed
                "Access-Control-Allow-Credentials": True
            }
        } 