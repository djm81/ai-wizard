#!/usr/bin/env python3
import subprocess
import json
import sys

def get_latest_run_logs():
    """Get logs from the latest workflow run"""
    try:
        # Get latest run ID
        result = subprocess.run(
            ['gh', 'run', 'list', '--limit', '1', '--json', 'databaseId'],
            capture_output=True, text=True
        )
        run_id = json.loads(result.stdout)[0]['databaseId']

        # Get run logs
        result = subprocess.run(
            ['gh', 'run', 'view', str(run_id), '--log'],
            capture_output=True, text=True
        )
        return result.stdout
    except Exception as e:
        print(f"Error getting logs: {e}")
        return None

def analyze_error(logs):
    """Analyze workflow logs for common errors"""
    if not logs:
        return

    error_patterns = {
        "terraform": {
            "pattern": "Error: ",
            "solution": "Check Terraform configuration and AWS credentials"
        },
        "python": {
            "pattern": "ImportError",
            "solution": "Check Python dependencies and virtual environment"
        },
        "aws": {
            "pattern": "AccessDenied",
            "solution": "Verify AWS IAM permissions and role configuration"
        }
    }

    for error_type, config in error_patterns.items():
        if config["pattern"] in logs:
            print(f"\nFound {error_type} error!")
            print(f"Suggested solution: {config['solution']}")
            print("Relevant log section:")
            # Print the line containing the error and surrounding context
            lines = logs.split('\n')
            for i, line in enumerate(lines):
                if config["pattern"] in line:
                    context_start = max(0, i-2)
                    context_end = min(len(lines), i+3)
                    print('\n'.join(lines[context_start:context_end]))

if __name__ == "__main__":
    logs = get_latest_run_logs()
    if logs:
        analyze_error(logs)