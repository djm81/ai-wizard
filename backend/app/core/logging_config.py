"""Logging configuration module for AI Wizard backend."""

import json
import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict

import structlog

from app.core.config import settings


def setup_lambda_logging():
    """Configure logging specifically for Lambda environment."""
    # Configure root logger for Lambda
    root_logger = logging.getLogger()
    if root_logger.handlers:
        for handler in root_logger.handlers:
            root_logger.removeHandler(handler)

    # Lambda writes to stdout by default
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONLogFormatter())
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    return root_logger

def setup_file_logging():
    """Configure file-based logging for local development."""
    log_dir = Path("app/logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    # Create handlers
    console_handler = logging.StreamHandler(sys.stdout)
    file_handler = RotatingFileHandler(
        filename=log_dir / "app.log",
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding="utf-8",
    )

    # Create formatters and add it to handlers
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    console_handler.setFormatter(logging.Formatter(log_format))
    file_handler.setFormatter(logging.Formatter(log_format))

    # Add handlers to the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    return root_logger

def setup_structlog():
    """Configure structured logging with structlog."""
    # Configure processors based on environment
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Add JSON renderer for Lambda, otherwise use dev console renderer
    if settings.IS_LAMBDA:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())

    # Configure structlog
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Get the logger
    return structlog.get_logger("ai-wizard")

def setup_logging():
    """Configure all logging for the application."""
    # Set up base logging depending on environment
    if settings.IS_LAMBDA:
        base_logger = setup_lambda_logging()
    else:
        base_logger = setup_file_logging()

    # Set up structlog
    struct_logger = setup_structlog()

    # Return the structlog logger as the primary logger
    return struct_logger

# Initialize logging
logger = setup_logging()

def get_request_logger(request_id: str = None, **kwargs) -> Any:
    """Get a logger instance with request context."""
    log_context = {
        "request_id": request_id,
        "environment": settings.ENVIRONMENT,
        "is_lambda": settings.IS_LAMBDA
    } if request_id else {
        "environment": settings.ENVIRONMENT,
        "is_lambda": settings.IS_LAMBDA
    }
    log_context.update(kwargs)
    return logger.bind(**log_context)

class JSONLogFormatter(logging.Formatter):
    """Custom JSON formatter for logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format the log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "environment": settings.ENVIRONMENT,
            "is_lambda": settings.IS_LAMBDA
        }

        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        if record.exc_info:
            log_data["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(log_data)
