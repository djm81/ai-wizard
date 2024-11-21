#!/usr/bin/env python3
"""update_dependencies module for AI Wizard backend."""

import logging
import os
import subprocess
import sys
from pathlib import Path

# Set up logging with color support
class ColoredFormatter(logging.Formatter):
    """Custom formatter that preserves ANSI color codes."""
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: grey + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

# Set up logger with color support
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(ColoredFormatter())
logger.addHandler(ch)

def run_command(cmd: list[str], cwd: str) -> bool:
    """Run a command and return True if successful."""
    try:
        logger.info("Running command: %s in %s", " ".join(cmd), cwd)
        # Use PIPE for stdout and stderr
        process = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            # Enable color output
            env={"FORCE_COLOR": "1", "TERM": "xterm-256color", **os.environ},
            # Buffer size 1 for real-time output
            bufsize=1,
            universal_newlines=True
        )

        # Real-time output processing
        while True:
            # Read stdout
            stdout_line = process.stdout.readline() if process.stdout else ""
            if stdout_line:
                print(stdout_line.rstrip())
                sys.stdout.flush()

            # Read stderr
            stderr_line = process.stderr.readline() if process.stderr else ""
            if stderr_line:
                print(stderr_line.rstrip(), file=sys.stderr)
                sys.stderr.flush()

            # Check if process has finished
            if process.poll() is not None and not stdout_line and not stderr_line:
                break

        # Get return code
        return_code = process.wait()
        
        if return_code != 0:
            logger.error("Command failed with exit code %d", return_code)
            return False
        return True

    except subprocess.CalledProcessError as e:
        logger.error("Command failed with exit code %d", e.returncode)
        if e.stdout:
            logger.error("Command output:\n%s", e.stdout)
        if e.stderr:
            logger.error("Command stderr:\n%s", e.stderr)
        return False
    except Exception as e:
        logger.error("Unexpected error running command: %s", str(e))
        return False

def update_frontend() -> bool:
    """Update frontend dependencies and run tests."""
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        logger.error("Frontend directory not found")
        return False

    # Update npm dependencies
    if not run_command(["npm", "update"], str(frontend_dir)):
        return False

    # Run frontend tests
    if not run_command(["npm", "run", "test"], str(frontend_dir)):
        return False

    logger.info("Frontend update and tests completed successfully")
    return True

def update_backend() -> bool:
    """Update backend dependencies and run tests."""
    backend_dir = Path("backend")
    if not backend_dir.exists():
        logger.error("Backend directory not found")
        return False

    # Update poetry dependencies
    if not run_command(["poetry", "update"], str(backend_dir)):
        return False

    # Run backend tests
    if not run_command(["poetry", "run", "pytest"], str(backend_dir)):
        return False

    logger.info("Backend update and tests completed successfully")
    return True

def main() -> int:
    """Main function to update both frontend and backend."""
    logger.info("Starting dependency updates and tests")

    # Update frontend
    if not update_frontend():
        logger.error("Frontend update failed")
        return 1

    # Update backend
    if not update_backend():
        logger.error("Backend update failed")
        return 1

    logger.info("All updates and tests completed successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 