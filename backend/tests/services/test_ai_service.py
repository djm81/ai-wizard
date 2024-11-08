import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_service import AIService
from app.core.config import Settings
import openai

@pytest.mark.unit
class TestAIService:
    """Test suite for AIService"""

    @pytest.fixture
    def mock_settings(self):
        """Create mock settings for testing"""
        with patch('app.services.ai_service.settings', autospec=True) as mock_settings:
            mock_settings.OPENAI_MODEL = "gpt-4-turbo-preview"
            mock_settings.OPENAI_API_KEY = None
            yield mock_settings

    @pytest.fixture
    def ai_service(self, db_session, mock_settings):
        """Create AIService instance with mocked settings"""
        return AIService(db_session)

    @pytest.mark.asyncio
    async def test_refine_requirements_success(self, ai_service):
        """Test successful requirements refinement"""
        conversation_history = [
            "Create a web application",
            "What kind of web application?",
            "A todo list app"
        ]

        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Refined requirements"

        with patch('openai.ChatCompletion.acreate') as mock_create:
            mock_create.return_value = mock_response
            with patch.object(ai_service, '_get_api_key', return_value="mock-api-key"):
                result = await ai_service.refine_requirements(conversation_history)
                assert result == "Refined requirements"

                # Verify correct message structure
                calls = mock_create.call_args_list
                assert len(calls) == 1
                messages = calls[0].kwargs['messages']
                assert messages[0]['role'] == 'system'
                assert len(messages) == 4  # system + 3 conversation messages

    @pytest.mark.asyncio
    async def test_refine_requirements_error(self, ai_service):
        """Test error handling in requirements refinement"""
        conversation_history = ["Test prompt"]

        with patch('openai.ChatCompletion.acreate') as mock_create:
            mock_create.side_effect = Exception("API Error")
            with patch.object(ai_service, '_get_api_key', return_value="mock-api-key"):
                result = await ai_service.refine_requirements(conversation_history)
                assert "An error occurred" in result

    @pytest.mark.asyncio
    async def test_set_api_key(self, ai_service):
        """Test setting API key"""
        api_key = "test-api-key"
        result = await ai_service.set_api_key(api_key)
        assert result is True

    @pytest.mark.asyncio
    async def test_remove_api_key(self, ai_service):
        """Test removing API key"""
        result = await ai_service.remove_api_key()
        assert result is True