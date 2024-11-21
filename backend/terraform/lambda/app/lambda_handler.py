"""lambda_handler module for AI Wizard backend."""


def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Lambda function initialized successfully",
    }
