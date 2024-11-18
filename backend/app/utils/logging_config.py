"""logging_config module for AI Wizard backend."""

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
    # Check if running in AWS Lambda
    is_lambda = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

    # Set up root logger for Lambda environment
    if is_lambda:
        # Configure root logger for Lambda
        root_logger = logging.getLogger()
        if not root_logger.handlers:
            root_logger.setLevel(logging.INFO)
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(
                logging.Formatter(
                    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
                )
            )
            root_logger.addHandler(handler)

    # Set up service-specific logger
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.INFO)

    # Clear any existing handlers
    logger.handlers.clear()

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    if is_lambda:
        # In Lambda, just use stream handler which automatically goes to CloudWatch
        handler = logging.StreamHandler(sys.stdout)
    else:
        # In local development, log to file
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)

        handler = logging.FileHandler(log_dir / f"{service_name}.log")

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Ensure propagation to root logger in Lambda
    if is_lambda:
        logger.propagate = True

    return logger


# Create a default logger instance
logger = setup_logging()
