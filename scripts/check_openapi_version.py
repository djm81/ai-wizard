"""check_openapi_version module for AI Wizard backend."""

#!/usr/bin/env python
import sys
from pathlib import Path

import yaml


def check_openapi_version():
    """Check if OpenAPI spec version is 3.0.2"""
    spec_file = Path("backend/app/openapi/specification.yaml")

    if not spec_file.exists():
        print(f"OpenAPI specification not found at {spec_file}")
        return 1

    try:
        with open(spec_file) as f:
            spec = yaml.safe_load(f)

        if spec.get("openapi") != "3.0.2":
            print(f"OpenAPI version must be 3.0.2, found {spec.get('openapi')}")
            return 1

        return 0
    except Exception as e:
        print(f"Error checking OpenAPI version: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(check_openapi_version())
