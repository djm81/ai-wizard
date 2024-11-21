"""Logging configuration module for AI Wizard backend."""

import json
import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict

from app.core.config import settings


def setup_logging() -> None:
    """Configure logging based on environment."""
    # Create logger instance
    logger = logging.getLogger("ai-wizard")
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Clear any existing handlers
    logger.handlers.clear()

    # Create formatters
    if settings.IS_LAMBDA:
        # JSON formatter for CloudWatch
        class JsonFormatter(logging.Formatter):
            def format(self, record: logging.LogRecord) -> str:
                log_data: Dict[str, Any] = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "module": record.module,
                    "function": record.funcName,
                    "environment": settings.ENVIRONMENT,
                }
                if hasattr(record, "request_id"):
                    log_data["request_id"] = record.request_id
                if record.exc_info:
                    log_data["exception"] = self.formatException(record.exc_info)
                return json.dumps(log_data)

        formatter = JsonFormatter()
    else:
        # Standard formatter for local development
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # Console handler (always present)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    logger.addHandler(console_handler)

    # File handler (only in development)
    if not settings.IS_LAMBDA:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        log_file = log_dir / "ai-copilot.log"
        file_handler = RotatingFileHandler(
            log_file, maxBytes=10485760, backupCount=5, encoding="utf-8"  # 10MB
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
        logger.addHandler(file_handler)

    # Set root logger level
    logging.getLogger().setLevel(logging.WARNING)

    # Disable noisy loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("google.auth").setLevel(logging.WARNING)
    logging.getLogger("cachecontrol").setLevel(logging.WARNING)


# Initialize logging
setup_logging()

# Get logger instance
logger = logging.getLogger("ai-wizard")
