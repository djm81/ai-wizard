"""Test AI service module."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from openai import AsyncOpenAI

from app.services.ai_service import AIService


@pytest.fixture
def mock_response():
    """Create a mock OpenAI API response."""
    response = MagicMock()
    response.choices = [MagicMock()]
    response.choices[0].message.content = "Generated code"
    return response


class TestAIService:
    """Test AI service functionality."""

    async def test_generate_code(self, ai_service, mock_response):
        """Test code generation"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch("app.services.ai_service.AsyncOpenAI", return_value=mock_client) as mock_openai:
            await ai_service.set_api_key("test-key")
            response = await ai_service.generate_code("Test prompt")
            
            assert response == "Generated code"
            mock_openai.assert_called_once_with(api_key="test-key")
            mock_client.chat.completions.create.assert_called_once()

    async def test_refine_requirements(self, ai_service, mock_response):
        """Test requirements refinement"""
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch("app.services.ai_service.AsyncOpenAI", return_value=mock_client) as mock_openai:
            await ai_service.set_api_key("test-key")
            conversation = ["Initial requirements", "User feedback"]
            response = await ai_service.refine_requirements(conversation)
            
            assert response == "Generated code"
            mock_openai.assert_called_once_with(api_key="test-key")
            mock_client.chat.completions.create.assert_called_once()

    async def test_set_api_key(self, ai_service):
        """Test setting OpenAI API key"""
        mock_client = AsyncMock()
        with patch("app.services.ai_service.AsyncOpenAI", return_value=mock_client) as mock_openai:
            await ai_service.set_api_key("test-key")
            mock_openai.assert_called_once_with(api_key="test-key")
            assert ai_service.client == mock_client
