"""AI service module for OpenAI API interactions."""

from typing import List, Optional

from app.core.logging_config import logger
from openai import AsyncOpenAI


class AIService:
    """Service for AI-related operations."""

    def __init__(self, db=None):
        """Initialize AI service.

        Args:
            db (Session, optional): Database session. Defaults to None.
        """
        self.db = db
        self.client = None
        self.model = "gpt-4-turbo-preview"

    async def set_api_key(self, api_key: str) -> None:
        """Set OpenAI API key and initialize client."""
        try:
            self.client = AsyncOpenAI(api_key=api_key)
            logger.info("OpenAI client initialized")
        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {str(e)}")
            raise

    async def remove_api_key(self) -> None:
        """Remove OpenAI API key and clear client."""
        self.client = None
        logger.info("OpenAI client removed")

    async def generate_code(self, prompt: str) -> str:
        """Generate code based on prompt."""
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that generates code.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            raise

    async def refine_requirements(self, conversation: List[str]) -> str:
        """Refine requirements based on conversation history."""
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that refines project requirements.",
                }
            ]
            for message in conversation:
                messages.append({"role": "user", "content": message})

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error refining requirements: {str(e)}")
            raise
