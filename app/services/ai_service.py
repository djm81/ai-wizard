from fastapi import Depends, HTTPException, status
from app.core.config import settings
from app.services.auth_service import AuthService
from app.models.user import User
import openai

class AIService:
    def __init__(self, current_user: User = Depends(AuthService.get_current_user)):
        self.current_user = current_user
        self.model = settings.OPENAI_MODEL

    async def _get_api_key(self) -> str:
        # Retrieve the API key from a secure storage (e.g., database)
        # This is a placeholder - implement actual secure retrieval
        api_key = await self._get_user_api_key(self.current_user.id)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OpenAI API key not set. Please configure it in the settings."
            )
        return api_key

    async def _get_user_api_key(self, user_id: int) -> str:
        # Implement secure retrieval of the user's API key
        # This should interact with your database or secure storage
        pass

    async def generate_code(self, prompt: str) -> str:
        try:
            api_key = await self._get_api_key()
            openai.api_key = api_key

            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                n=1,
                stop=None,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Log the error and return a generic message
            print(f"Error generating code: {str(e)}")
            return "An error occurred while generating code."

    async def refine_requirements(self, conversation_history: list[str]) -> str:
        try:
            api_key = await self._get_api_key()
            openai.api_key = api_key

            messages = [{"role": "system", "content": "You are a helpful assistant that refines project requirements."}]
            for i, message in enumerate(conversation_history):
                role = "user" if i % 2 == 0 else "assistant"
                messages.append({"role": role, "content": message})

            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=messages,
                max_tokens=200,
                n=1,
                stop=None,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Log the error and return a generic message
            print(f"Error refining requirements: {str(e)}")
            return "An error occurred while refining requirements."

    async def set_api_key(self, api_key: str) -> bool:
        # Implement secure storage of the API key
        # This should interact with your database or secure storage
        pass

    async def remove_api_key(self) -> bool:
        # Implement secure removal of the API key
        # This should interact with your database or secure storage
        pass