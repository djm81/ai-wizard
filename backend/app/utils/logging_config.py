import logging
import os
import sys
from pathlib import Path

def setup_logging(service_name: str = "ai-copilot"):
    """
    Configure logging based on the runtime environment.
    
    Args:
        service_name (str): Name of the service for logging identification
    
    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.INFO)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Check if running in AWS Lambda
    is_lambda = bool(os.getenv('AWS_LAMBDA_FUNCTION_NAME'))
    
    if is_lambda:
        # In Lambda, just use stream handler which automatically goes to CloudWatch
        handler = logging.StreamHandler(sys.stdout)
    else:
        # In local development, log to file
        # Navigate up from app/utils to backend/logs
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        handler = logging.FileHandler(log_dir / f"{service_name}.log")
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

# Create a default logger instance
logger = setup_logging() 