#!/usr/bin/env python3
"""generate_openapi_spec module for AI Wizard backend."""

import os
import sys
from pathlib import Path

import yaml


def generate_openapi_spec():
    """Generate OpenAPI specification from FastAPI app and save to multiple locations."""
    # Get the absolute path to the project root (parent of scripts directory)
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"

    # Add backend directory to Python path for imports
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    # Also add the app directory to ensure all imports work
    app_dir = backend_dir / "app"
    if str(app_dir) not in sys.path:
        sys.path.insert(0, str(app_dir))

    # Now we can safely import the FastAPI components
    from fastapi.openapi.utils import get_openapi

    from app.core.config import settings  # type: ignore[import]

    # Import the app after setting up the paths
    try:
        from app.main import app  # type: ignore[import]
    except ImportError as e:
        print(f"Error importing app: {e}")
        print(f"Python path: {sys.path}")
        sys.exit(1)

    # Generate OpenAPI spec with explicit version
    openapi_schema = get_openapi(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        description=settings.API_DESCRIPTION,
        routes=app.routes,
    )

    # Force OpenAPI version to 3.0.4 for AWS compatibility
    openapi_schema["openapi"] = settings.OPENAPI_VERSION

    # Add AWS API Gateway extensions
    openapi_schema["x-amazon-apigateway-api-key-source"] = "HEADER"
    openapi_schema["x-amazon-apigateway-binary-media-types"] = ["*/*"]
    
    # Add default integration
    openapi_schema["x-amazon-apigateway-integration"] = {
        "uri": "${lambda_uri}",
        "payloadFormatVersion": "2.0",
        "type": "AWS_PROXY",
        "httpMethod": "POST",
        "timeoutInMillis": 30000,
        "connectionType": "INTERNET"
    }

    # Define paths relative to project root
    root_spec_path = app_dir / "openapi" / "specification.yaml"
    terraform_spec_path = backend_dir / "terraform" / "modules" / "backend" / "api" / "specification.yaml"

    # Ensure terraform/api directory exists
    terraform_spec_path.parent.mkdir(parents=True, exist_ok=True)

    # Write specs to both locations
    for spec_path in [root_spec_path, terraform_spec_path]:
        with open(spec_path, "w") as f:
            yaml.dump(openapi_schema, f, sort_keys=False)
        print(f"OpenAPI specification written to {spec_path}")


if __name__ == "__main__":
    generate_openapi_spec()
