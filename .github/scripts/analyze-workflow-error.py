#!/usr/bin/env python3
import subprocess
import json
import sys
import argparse

def get_latest_run_logs(workflow_name=None):
    """Get logs from the latest workflow run"""
    try:
        # Get latest run ID with optional workflow name filter
        command = ['gh', 'run', 'list', '--limit', '1', '--json', 'databaseId']
        if workflow_name:
            command += ['--workflow', workflow_name]
        result = subprocess.run(command, capture_output=True, text=True)
        
        run_id = json.loads(result.stdout)[0]['databaseId']

        # Get name of the workflow
        result = subprocess.run(
            ['gh', 'run', 'view', str(run_id), '--json', 'workflowName'],
            capture_output=True, text=True
        )
        wf_name = json.loads(result.stdout)['workflowName']

        # Get run logs
        result = subprocess.run(
            ['gh', 'run', 'view', str(run_id), '--log'],
            capture_output=True, text=True
        )
        
        return {
            "workflow_name": wf_name,
            "logs": result.stdout
        }
    except Exception as e:
        print(f"Error getting logs: {e}")
        return None

def analyze_error(logs_data):
    """Analyze workflow logs for common errors"""
    if not logs_data:
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

    logs = logs_data["logs"].split('\n')
    
    for error_type, config in error_patterns.items():
        print(f"Checking for {error_type} error in github workflow '{logs_data['workflow_name']}' logs...")
        for i, line in enumerate(logs):
            if config["pattern"] in line:
                print(f"\nFound {error_type} error!")
                print(f"Suggested solution: {config['solution']}")
                print("Relevant log section:")
                context_start = max(0, i-2)
                context_end = min(len(logs), i+3)
                print('\n'.join(logs[context_start:context_end]))
                # break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze workflow logs for common errors")
    parser.add_argument("-w", "--workflow", help="Specify the workflow name")
    args = parser.parse_args()

    logs_data = get_latest_run_logs(args.workflow)
    if logs_data:
        analyze_error(logs_data)