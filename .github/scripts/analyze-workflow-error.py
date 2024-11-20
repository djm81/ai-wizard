"""analyze-workflow-error module for AI Wizard backend."""

#!/usr/bin/env python3
import argparse
import json
import logging
import subprocess
from shutil import which
from typing import List, Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def run_command(command: list[str], **kwargs) -> subprocess.CompletedProcess:
    """Run a command with proper error handling and logging."""
    logger.info("Running command: %s", " ".join(command))
    try:
        # Using shell=False and list arguments for security
        return subprocess.run(  # nosec B603
            command,
            capture_output=True,
            text=True,
            check=True,
            shell=False,  # Explicitly set for security
            **kwargs,
        )
    except subprocess.CalledProcessError as e:
        logger.error(
            "Command failed with exit code %d: %s", e.returncode, e.stderr
        )
        raise


def validate_run_id(run_id: str) -> bool:
    """Validate run ID is numeric and within reasonable length."""
    return run_id.isdigit() and len(run_id) < 20


def get_workflow_logs(run_id: str) -> Optional[str]:
    """Safely get workflow logs with input validation."""
    if not validate_run_id(run_id):
        raise ValueError("Invalid run ID format")

    try:
        result = run_command(["gh", "run", "view", run_id, "--log"])
        return result.stdout
    except (subprocess.CalledProcessError, ValueError) as e:
        logger.error("Failed to get workflow logs: %s", e)
        return None


def validate_gh_cli() -> str:
    """Validate GitHub CLI installation and return full path."""
    gh_path = which("gh")
    if not gh_path:
        raise EnvironmentError("GitHub CLI (gh) not found in PATH")
    return gh_path


def get_workflow_name(run_id: str) -> Optional[str]:
    """Get workflow name from run ID."""
    try:
        result = run_command(
            ["gh", "run", "view", run_id, "--json", "workflowName"]
        )
        workflow_data = json.loads(result.stdout)
        return workflow_data.get("workflowName")
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        logger.error("Failed to get workflow name: %s", e)
        return None


def get_latest_run_logs(workflow_name=None):
    """Get logs from the latest workflow run"""
    try:
        # Get latest run ID with optional workflow name filter
        command = ["gh", "run", "list", "--limit", "1", "--json", "databaseId"]
        if workflow_name:
            command += ["--workflow", workflow_name]
        result = run_command(command)

        run_id = json.loads(result.stdout)[0]["databaseId"]

        # Get name of the workflow
        result = run_command(
            ["gh", "run", "view", str(run_id), "--json", "workflowName"]
        )
        wf_name = json.loads(result.stdout)["workflowName"]

        # Get run logs
        result = run_command(["gh", "run", "view", str(run_id), "--log"])

        return {"workflow_name": wf_name, "logs": result.stdout}
    except (subprocess.CalledProcessError, json.JSONDecodeError, OSError) as e:
        logger.error("Error getting logs: %s", e)
        return None


def analyze_workflow_error(workflow_logs: str) -> None:
    """Analyze workflow error from logs."""
    if not workflow_logs:
        logger.error("No workflow logs provided")
        return

    # Log analysis results
    logger.error("Workflow failed with error: %s", "Error details")
    logger.error("Suggested fix: %s", "Fix suggestion")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Analyze workflow logs for common errors"
    )
    parser.add_argument("-w", "--workflow", help="Specify the workflow name")
    args = parser.parse_args()

    logs_data = get_latest_run_logs(args.workflow)
    if logs_data:
        analyze_workflow_error(logs_data["logs"])
