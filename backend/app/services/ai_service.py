from typing import List, Optional
import openai
from sqlalchemy.orm import Session
from app.core.config import settings

class AIService:
    def __init__(self, db_session: Session):
        """Initialize AIService with database session and OpenAI client

        Args:
            db_session (Session): SQLAlchemy database session
        """
        self.db = db_session
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def set_api_key(self, api_key: str) -> bool:
        """Set OpenAI API key"""
        try:
            self.client = openai.AsyncOpenAI(api_key=api_key)
            return True
        except Exception:
            return False

    def remove_api_key(self) -> bool:
        """Remove OpenAI API key"""
        try:
            self.client = openai.AsyncOpenAI(api_key=None)
            return True
        except Exception:
            return False

    async def refine_requirements(self, conversation_history: List[str]) -> str:
        """Refine project requirements based on conversation history"""
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant that refines project requirements."},
            ]
            
            # Add conversation history as alternating user/assistant messages
            for i, message in enumerate(conversation_history):
                role = "user" if i % 2 == 0 else "assistant"
                messages.append({"role": role, "content": message})
            
            # Add final instruction
            messages.append({
                "role": "user", 
                "content": "Please refine these requirements into a clear project specification."
            })

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in refine_requirements: {str(e)}")
            return "An error occurred while refining requirements."

    async def generate_code(self, prompt: str) -> str:
        """Generate code based on the given prompt"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating code: {str(e)}")
            return "An error occurred while generating code."