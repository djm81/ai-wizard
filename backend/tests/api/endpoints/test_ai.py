"""test_ai module for AI Wizard backend."""

from unittest.mock import patch

import pytest
from app.services.auth_service import AuthService


class TestAIEndpoints:
    async def test_refine_requirements(self, client, test_user, auth_headers):
        with patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            conversation = ["First message", "Second message"]
            response = client.post(
                "/ai/refine-requirements",
                json=conversation,
                headers=auth_headers,
            )
            assert response.status_code == 200

    async def test_generate_code(self, client, test_user, auth_headers):
        with patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            request_data = {"prompt": "Generate a Python function"}
            response = client.post(
                "/ai/generate-code", json=request_data, headers=auth_headers
            )
            assert response.status_code == 200


# ruff: noqa: B101
