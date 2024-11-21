"""User model for AI Wizard backend."""

from __future__ import annotations

from typing import TYPE_CHECKING, List, Optional

from app.models.base import Base
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.ai_interaction import AIInteraction
    from app.models.project import Project
    from app.models.user_profile import UserProfile


class User(Base):
    """User model."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships with proper type hints
    projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    ai_interactions: Mapped[List["AIInteraction"]] = relationship(
        "AIInteraction",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
