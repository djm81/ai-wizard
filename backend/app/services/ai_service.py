"""ai_service module for AI Wizard backend."""

import logging
from typing import List, Optional

import openai
from app.core.config import settings
from app.db.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class AIService:
    """Service for handling AI operations"""

    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.model = settings.OPENAI_MODEL
        self.client = None
        # Only initialize OpenAI client if API key is available
        if settings.OPENAI_API_KEY:
            try:
                self.client = openai.AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY.get_secret_value()
                )
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.client = None

    async def set_api_key(self, api_key: str) -> bool:
        """Set OpenAI API key"""
        try:
            self.client = openai.AsyncOpenAI(api_key=api_key)
            return True
        except Exception as e:
            logger.error(f"Failed to set API key: {str(e)}")
            return False

    async def remove_api_key(self) -> bool:
        """Remove OpenAI API key"""
        try:
            # Create client with no API key to properly clean up
            self.client = openai.AsyncOpenAI(api_key=None)
            return True
        except Exception as e:
            logger.error(f"Failed to remove API key: {str(e)}")
            return False

    async def refine_requirements(self, conversation_history: list[str]) -> str:
        """Refine project requirements based on conversation history"""
        if not self.client:
            return "OpenAI client not initialized. Please set API key first."

        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that refines project requirements.",
                },
            ]

            # Add conversation history as alternating user/assistant messages
            for i, message in enumerate(conversation_history):
                role = "user" if i % 2 == 0 else "assistant"
                messages.append({"role": role, "content": message})

            # Add final instruction
            messages.append(
                {
                    "role": "user",
                    "content": "Please refine these requirements into a clear project specification.",
                }
            )

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error in refine_requirements: {str(e)}")
            return "An error occurred while refining requirements."

    async def generate_code(self, prompt: str) -> str:
        """Generate code based on the given prompt"""
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
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating code: {str(e)}")
            return "An error occurred while generating code."
