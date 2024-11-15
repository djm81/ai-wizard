import pytest
from unittest.mock import patch, AsyncMock
from app.services.ai_service import AIService

@pytest.mark.asyncio
class TestAIService:
    """Test suite for AIService"""

    async def test_refine_requirements_success(self, ai_service):
        """Test requirements refinement success"""
        # Create mock client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value.choices = [
            AsyncMock(message=AsyncMock(content="Refined requirements"))
        ]
        ai_service.client = mock_client
        
        conversation_history = [
            "Create a web application",
            "What kind of web application?",
            "A todo list app"
        ]
        result = await ai_service.refine_requirements(conversation_history)
        assert result == "Refined requirements"

    async def test_refine_requirements_error(self, ai_service):
        """Test requirements refinement with error"""
        # Create mock client
        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        ai_service.client = mock_client
        
        conversation_history = [
            "Create a web application",
            "What kind of web application?",
            "A todo list app"
        ]
        result = await ai_service.refine_requirements(conversation_history)
        assert result == "An error occurred while refining requirements."

    async def test_set_api_key(self, ai_service):
        """Test setting OpenAI API key"""
        mock_client = AsyncMock()
        with patch('openai.AsyncOpenAI', return_value=mock_client) as mock_openai:
            result = await ai_service.set_api_key("test_key")
            assert result is True
            mock_openai.assert_called_once_with(api_key="test_key")
            assert ai_service.client == mock_client

    async def test_remove_api_key(self, ai_service):
        """Test removing OpenAI API key"""
        # First set an API key to ensure we have a client
        mock_client = AsyncMock()
        with patch('openai.AsyncOpenAI', return_value=mock_client) as mock_openai:
            # Set API key first
            await ai_service.set_api_key("test_key")
            mock_openai.assert_called_once_with(api_key="test_key")
            
            # Reset the mock for the remove operation
            mock_openai.reset_mock()
            
            # Now test removing the key
            result = await ai_service.remove_api_key()
            assert result is True
            mock_openai.assert_called_once_with(api_key=None)
            assert ai_service.client == mock_client