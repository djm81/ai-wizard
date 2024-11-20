"""user module for AI Wizard backend."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from app.models.base import Base
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.ai_interaction import AIInteraction
    from app.models.project import Project
    from app.models.user_profile import UserProfile


class User(Base):
    """User model for storing user related details"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)

    # Relationships with proper type hints
    projects: Mapped[List[Project]] = relationship(
        "Project", back_populates="user", cascade="all, delete-orphan"
    )
    ai_interactions: Mapped[List[AIInteraction]] = relationship(
        "AIInteraction", back_populates="user", cascade="all, delete-orphan"
    )
    profile: Mapped[UserProfile | None] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
