#!/usr/bin/env python3
"""validate_pipeline_dirs module for AI Wizard backend."""

import sys
from pathlib import Path

import yaml


def validate_working_directories(filename):
    """Validate working directories in pipeline files"""
    try:
        with open(filename) as f:
            pipeline = yaml.safe_load(f)

        errors = []
        for job in pipeline.get("jobs", {}).values():
            if isinstance(job, dict):
                for step in job.get("steps", []):
                    # Only check if both working-directory and env.WORKING_DIRECTORY are used in same step
                    if "working-directory" in step and step["working-directory"].startswith("backend/"):
                        # Check if this step or its job uses WORKING_DIRECTORY env var
                        has_working_dir_env = False
                        if "env" in step and "WORKING_DIRECTORY" in step["env"]:
                            has_working_dir_env = True
                        elif "env" in job and "WORKING_DIRECTORY" in job.get("env", {}):
                            has_working_dir_env = True

                        if has_working_dir_env:
                            errors.append(
                                f"Working directory '{step['working-directory']}' "
                                f"should not include 'backend/' prefix when "
                                f"WORKING_DIRECTORY env var is used"
                            )

        if errors:
            print("\n".join(errors))
            return 1

        return 0
    except Exception as e:
        print(f"Error validating pipeline working directories: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(validate_working_directories(sys.argv[1]))
