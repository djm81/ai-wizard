"""test_ai module for AI Wizard backend."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.auth_service import AuthService


@pytest.fixture
def mock_response():
    """Create a mock OpenAI API response."""
    response = MagicMock()
    response.choices = [MagicMock()]
    response.choices[0].message.content = "Generated response"
    return response


class TestAIEndpoints:
    async def test_refine_requirements(self, client, test_user, auth_headers, mock_response):
        """Test refining requirements endpoint"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch("app.services.ai_service.AsyncOpenAI", return_value=mock_client), patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            conversation = ["First message", "Second message"]
            response = client.post(
                "/ai/refine-requirements",
                json=conversation,
                headers=auth_headers,
            )
            assert response.status_code == 200
            assert response.json() == "Generated response"

    async def test_generate_code(self, client, test_user, auth_headers, mock_response):
        """Test code generation endpoint"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch("app.services.ai_service.AsyncOpenAI", return_value=mock_client), patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            request_data = {"prompt": "Generate a Python function"}
            response = client.post("/ai/generate-code", json=request_data, headers=auth_headers)
            assert response.status_code == 200
            assert response.json() == "Generated response"


# ruff: noqa: B101
