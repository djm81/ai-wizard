import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.ai_service import AIService
from app.core.config import Settings

@pytest.mark.asyncio
class TestAIService:
    """Test suite for AIService"""

    @pytest.fixture
    def mock_settings(self):
        """Create mock settings for testing"""
        with patch('app.services.ai_service.settings', autospec=True) as mock_settings:
            mock_settings.OPENAI_MODEL = "gpt-4-turbo-preview"
            mock_settings.OPENAI_API_KEY = "test-key"
            yield mock_settings

    @pytest.fixture
    def ai_service(self, db_session, mock_settings):
        """Create AIService instance with mocked settings"""
        return AIService(db_session)

    @pytest.mark.asyncio
    async def test_refine_requirements_success(self, ai_service):
        """Test successful requirements refinement"""
        # Create a proper mock response structure
        mock_choice = MagicMock()
        mock_choice.message.content = "Refined requirements"
        mock_response = AsyncMock()
        mock_response.choices = [mock_choice]
        
        # Mock the create method of chat.completions
        mock_completions = AsyncMock()
        mock_completions.create.return_value = mock_response
        
        # Apply the mock to the client's chat.completions
        with patch.object(ai_service.client, 'chat', completions=mock_completions):
            conversation_history = [
                "Create a web application",
                "What kind of web application?",
                "A todo list app"
            ]
            result = await ai_service.refine_requirements(conversation_history)
            assert result == "Refined requirements"
            
            # Verify the mock was called with correct parameters
            mock_completions.create.assert_called_once()
            call_args = mock_completions.create.call_args[1]
            assert call_args['model'] == ai_service.model
            assert len(call_args['messages']) == len(conversation_history) + 2  # +2 for system and final messages
            assert call_args['temperature'] == 0.7
            assert call_args['max_tokens'] == 1000

    @pytest.mark.asyncio
    async def test_refine_requirements_error(self, ai_service):
        """Test requirements refinement with error"""
        # Create a mock that raises an exception
        mock_completions = AsyncMock()
        mock_completions.create.side_effect = Exception("API Error")
        
        with patch.object(ai_service.client, 'chat', completions=mock_completions):
            conversation_history = [
                "Create a web application",
                "What kind of web application?",
                "A todo list app"
            ]
            result = await ai_service.refine_requirements(conversation_history)
            assert result == "An error occurred while refining requirements."

    def test_set_api_key(self, ai_service):
        """Test setting OpenAI API key"""
        with patch('openai.AsyncOpenAI') as mock_openai:
            result = ai_service.set_api_key("test_key")
            assert result is True
            mock_openai.assert_called_once_with(api_key="test_key")

    def test_remove_api_key(self, ai_service):
        """Test removing OpenAI API key"""
        with patch('openai.AsyncOpenAI') as mock_openai:
            result = ai_service.remove_api_key()
            assert result is True
            mock_openai.assert_called_once_with(api_key=None)