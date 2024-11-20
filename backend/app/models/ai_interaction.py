"""ai_interaction module for AI Wizard backend."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from app.models.base import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class AIInteraction(Base):
    """AI Interaction model for storing AI chat interactions"""

    __tablename__ = "ai_interactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    prompt: Mapped[str] = mapped_column(String, nullable=False)
    response: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships with proper type hints and forward refs
    user: Mapped["User"] = relationship(
        "User", back_populates="ai_interactions", foreign_keys=[user_id]
    )
    project: Mapped["Project"] = relationship(
        "Project", back_populates="ai_interactions", foreign_keys=[project_id]
    )
