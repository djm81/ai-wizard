"""aggregate_logs module for AI Wizard backend."""

#!/usr/bin/env python
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def format_log_section(title: str, content: str) -> str:
    """Format a section of the log file with proper headers."""
    return (
        f"\n{'='*80}\n"
        f"{title}\n"
        f"{'='*80}\n"
        f"{content}\n"
    )


def get_latest_report() -> Optional[Path]:
    """Get the most recent linting report."""
    logs_dir = Path("logs")
    if not logs_dir.exists():
        return None

    reports = list(logs_dir.glob("linting_report_*.log"))
    if not reports:
        return None

    return max(reports, key=lambda p: p.stat().st_mtime)


def append_bandit_results(report_path: Path) -> None:
    """Append bandit scan results to the report."""
    bandit_log = Path("logs/bandit.log")
    if not bandit_log.exists():
        logger.warning("No bandit results found")
        return

    try:
        with open(bandit_log) as f:
            bandit_content = f.read()

        with open(report_path, "a") as f:
            f.write(format_log_section("Bandit Security Scan", bandit_content))

        logger.info("Added bandit results to report: %s", report_path)
    except Exception as e:
        logger.error("Failed to append bandit results: %s", e)


def aggregate_logs() -> int:
    """Aggregate all linting results into a single report."""
    try:
        # Get the latest report (created by pylint)
        report_path = get_latest_report()
        if not report_path:
            logger.error("No linting report found")
            return 1

        # Add bandit results
        append_bandit_results(report_path)

        # Add processed files list
        with open(report_path, "a") as f:
            f.write("\nLog files processed:\n")
            f.write("- logs/pylint.log\n")
            f.write("- logs/bandit.log\n")

        logger.info("Logs aggregated successfully in: %s", report_path)
        return 0

    except Exception as e:
        logger.error("Failed to aggregate logs: %s", e)
        return 1


if __name__ == "__main__":
    exit(aggregate_logs()) 