import logging
import logging.handlers
import os
from pathlib import Path
from app.core.config import settings

# Create logs directory if it doesn't exist
LOGS_DIR = Path(__file__).parent.parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

def setup_logging():
    """Configure logging for the application"""
    # Create formatters
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )

    # Create handlers
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(settings.LOG_LEVEL)

    # File handler for all logs
    all_logs_file = LOGS_DIR / "app.log"
    file_handler = logging.handlers.RotatingFileHandler(
        all_logs_file,
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(settings.LOG_LEVEL)

    # File handler for errors only
    error_logs_file = LOGS_DIR / "error.log"
    error_file_handler = logging.handlers.RotatingFileHandler(
        error_logs_file,
        maxBytes=10485760,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    error_file_handler.setFormatter(file_formatter)
    error_file_handler.setLevel(logging.ERROR)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers = []
    
    # Add handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_file_handler)

    # Log startup message
    root_logger.info(f"Logging initialized. Log files will be written to {LOGS_DIR}") 