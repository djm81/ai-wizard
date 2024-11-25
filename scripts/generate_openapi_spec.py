#!/usr/bin/env python3
"""generate_openapi_spec module for AI Wizard backend."""

import sys
from pathlib import Path

import yaml
from yaml import SafeDumper


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

    # Define a custom string class to enforce quoting
    class QuotedString(str):
        """String subclass to enforce double quotes in YAML serialization."""
        pass

    # Define a custom representer for QuotedString
    def quoted_str_representer(dumper, data):
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='"')

    # Register the custom representer with SafeDumper
    yaml.add_representer(QuotedString, quoted_str_representer, Dumper=SafeDumper)

    # Generate OpenAPI spec with explicit version
    openapi_schema = get_openapi(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        description=settings.API_DESCRIPTION,
        routes=app.routes,
    )

    # Force OpenAPI version to 3.0.4 for AWS compatibility
    openapi_schema["openapi"] = settings.OPENAPI_VERSION

    # Add AWS API Gateway extensions at root level
    openapi_schema["x-amazon-apigateway-api-key-source"] = "HEADER"
    openapi_schema["x-amazon-apigateway-binary-media-types"] = ["*/*"]

    # Collect paths that need OPTIONS methods
    options_to_add = {}

    # Sanitize paths by removing trailing slashes
    sanitized_paths = {}
    for path, path_item in openapi_schema["paths"].items():
        if path != "/" and path.endswith("/"):
            new_path = path.rstrip("/")
        else:
            new_path = path
        sanitized_paths[new_path] = path_item

    openapi_schema["paths"] = sanitized_paths

    # Add integration settings to each path operation
    for path in openapi_schema["paths"]:
        for method, operation in dict(openapi_schema["paths"][path]).items():
            if method.lower() != 'options':  # Skip OPTIONS methods
                # Add AWS integration
                operation["x-amazon-apigateway-integration"] = {
                    "uri": "${lambda_uri}",
                    "payloadFormatVersion": "2.0",
                    "type": "AWS_PROXY",
                    "httpMethod": "POST",
                    "timeoutInMillis": 30000,
                    "connectionType": "INTERNET"
                }
                # Collect paths that need OPTIONS
                if 'security' in operation and path not in options_to_add:
                    options_to_add[path] = {
                        "summary": "CORS support",
                        "description": "Enable CORS by returning correct headers",
                        "responses": {
                            "200": {
                                "description": "Default response for CORS method",
                                "headers": {
                                    "Access-Control-Allow-Origin": {
                                        "schema": {"type": "string"}
                                    },
                                    "Access-Control-Allow-Methods": {
                                        "schema": {"type": "string"}
                                    },
                                    "Access-Control-Allow-Headers": {
                                        "schema": {"type": "string"}
                                    }
                                },
                                "content": {}
                            }
                        },
                        "x-amazon-apigateway-integration": {
                            "type": "mock",
                            "requestTemplates": {
                                "application/json": '{"statusCode": 200}'
                            },
                            "responses": {
                                "default": {
                                    "statusCode": "200",
                                    "responseParameters": {
                                        "method.response.header.Access-Control-Allow-Headers": QuotedString("Content-Type,Authorization,X-Amz-Date,X-Api-Key"),
                                        "method.response.header.Access-Control-Allow-Methods": QuotedString("*"),
                                        "method.response.header.Access-Control-Allow-Origin": QuotedString("*")
                                    },
                                    "responseTemplates": {
                                        "application/json": "{}"
                                    }
                                }
                            }
                        }
                    }

    # Add OPTIONS methods after iteration
    for path, options_method in options_to_add.items():
        openapi_schema["paths"][path]["options"] = options_method

    # Define paths relative to project root
    root_spec_path = app_dir / "openapi" / "specification.yaml"
    terraform_spec_path = backend_dir / "terraform" / "modules" / "backend" / "api" / "specification.yaml"

    # Ensure terraform/api directory exists
    terraform_spec_path.parent.mkdir(parents=True, exist_ok=True)

    # Write specs to both locations
    for spec_path in [root_spec_path, terraform_spec_path]:
        with open(spec_path, "w") as f:
            yaml.dump(openapi_schema, f, sort_keys=False, Dumper=yaml.SafeDumper)
        print(f"OpenAPI specification written to {spec_path}")


if __name__ == "__main__":
    generate_openapi_spec()
