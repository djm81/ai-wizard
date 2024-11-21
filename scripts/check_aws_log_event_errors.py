#!/usr/bin/env python3
"""check_aws_log_event_errors module for AI Wizard backend."""

import json
import logging
import subprocess
import sys
from typing import Dict, List, Optional

# ANSI color codes
RED = "\033[31m"
RESET = "\033[0m"

# Set up logging with color support
class ColoredFormatter(logging.Formatter):
    """Custom formatter that preserves ANSI color codes."""
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: grey + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: red + format_str + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(ColoredFormatter())
logger.addHandler(ch)

def run_aws_command(command: List[str]) -> Optional[Dict]:
    """Run AWS CLI command and return JSON output."""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        logger.error("AWS command failed: %s", e.stderr)
        return None
    except json.JSONDecodeError as e:
        logger.error("Failed to parse AWS command output: %s", e)
        return None

def get_last_log_stream(log_group: str) -> Optional[str]:
    """Get the name of the most recent log stream."""
    result = run_aws_command([
        "aws", "logs", "describe-log-streams",
        "--log-group-name", log_group,
        "--limit", "1",
        "--descending",
        "--output", "json"
    ])
    
    if not result or not result.get("logStreams"):
        return None
    
    return result["logStreams"][0]["logStreamName"]

def get_log_events(log_group: str, log_stream: str) -> List[Dict]:
    """Get all events from a log stream."""
    result = run_aws_command([
        "aws", "logs", "get-log-events",
        "--log-group-name", log_group,
        "--log-stream-name", log_stream,
        "--output", "json"
    ])
    
    return result.get("events", []) if result else []

def format_log_message(message: str) -> str:
    """Format log message, removing quotes and escapes."""
    return message.strip('"').replace("\\t", "\t").replace("\\n", "\n")

def main() -> int:
    """Main function to check AWS log events for errors."""
    LOG_GROUP = "/aws/lambda/ai-wizard-backend-dev-v2"
    
    # Get the last log stream
    logger.info("Checking log stream for errors...")
    log_stream = get_last_log_stream(LOG_GROUP)
    if not log_stream:
        logger.error("Failed to get log stream")
        return 1
    
    logger.info("Checking log stream: %s", log_stream)
    
    # Get log events
    events = get_log_events(LOG_GROUP, log_stream)
    logger.info("Retrieved %d log events", len(events))
    
    # Filter error events
    error_events = [
        event for event in events 
        if "[ERROR]" in event.get("message", "")
    ]
    
    if not error_events:
        logger.info("No errors found")
        return 0
    
    # Print error events
    print(f"\nFound {len(error_events)} error events in selected log stream:")
    print("-" * 60)
    
    print_normal = False
    for event in events:
        message = event.get("message", "")
        if "[ERROR]" in message:
            # Print error message in red
            print(f"{RED}{format_log_message(message)}{RESET}")
            print_normal = True
        elif print_normal:
            # Print related messages in normal color
            if not message.strip():
                print_normal = False
                print("-" * 60)
            else:
                print(format_log_message(message))
    
    print(f"\nSummary: Found {len(error_events)} error events in selected log stream.")
    return 1 if error_events else 0

if __name__ == "__main__":
    sys.exit(main()) 