"""user_profile module for AI Wizard backend."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Dict

from app.models.base import Base
from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.user import User


class UserProfile(Base):
    """User Profile model for storing additional user details"""

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    bio: Mapped[str | None] = mapped_column(String, nullable=True)
    preferences: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # Relationship with proper type hints
    user: Mapped["User"] = relationship("User", back_populates="profile")
