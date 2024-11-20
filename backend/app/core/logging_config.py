"""Logging configuration module for AI Wizard backend."""

import json
import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict

from app.core.config import settings


def setup_logging() -> None:
    """Configure logging based on environment."""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Clear any existing handlers
    logger.handlers.clear()

    # Create formatters
    if not settings.IS_LAMBDA:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    else:
        # JSON formatter for production
        class JsonFormatter(logging.Formatter):
            def format(self, record: logging.LogRecord) -> str:
                log_data: Dict[str, Any] = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "module": record.module,
                    "function": record.funcName,
                }
                if hasattr(record, "request_id"):
                    log_data["request_id"] = record.request_id
                return json.dumps(log_data)

        formatter = JsonFormatter()

    # Console handler (always present)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (only in development)
    if not settings.IS_LAMBDA:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        log_file = log_dir / f"app_{datetime.now():%Y%m%d}.log"
        file_handler = RotatingFileHandler(
            log_file, maxBytes=10485760, backupCount=5
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    # Set logging level based on environment
    logger.setLevel(logging.DEBUG if not settings.IS_LAMBDA else logging.INFO)


# Get logger instance
logger = logging.getLogger("ai-wizard")

# Initialize logging
setup_logging()
