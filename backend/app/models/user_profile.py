"""User profile model for AI Wizard backend."""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import JSON, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserProfile(Base):
    """UserProfile model."""

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    name: Mapped[str] = mapped_column(String)
    bio: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    _preferences: Mapped[Dict[str, Any]] = mapped_column("preferences", JSON)

    # Relationship with proper type hint
    user: Mapped["User"] = relationship("User", back_populates="profile", lazy="selectin")

    @property
    def preferences(self) -> Dict[str, Any]:
        """Get preferences as a Python dictionary."""
        if isinstance(self._preferences, str):
            return json.loads(self._preferences)
        return self._preferences

    @preferences.setter
    def preferences(self, value: Dict[str, Any]) -> None:
        """Set preferences, ensuring proper JSON handling."""
        if isinstance(value, str):
            self._preferences = json.loads(value)
        else:
            self._preferences = value

    def __init__(self, **kwargs: Any) -> None:
        """Initialize UserProfile with proper JSON handling."""
        # Handle preferences if provided
        preferences = kwargs.pop("preferences", None)
        super().__init__(**kwargs)
        if preferences is not None:
            self.preferences = preferences
