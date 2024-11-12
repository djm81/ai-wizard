from __future__ import annotations
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base import Base
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.ai_interaction import AIInteraction

class Project(Base):
    """Project model for storing project related details"""
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String)

    # Relationships with proper type hints
    user: Mapped[User] = relationship(
        "User", 
        back_populates="projects"
    )
    ai_interactions: Mapped[List[AIInteraction]] = relationship(
        "AIInteraction", 
        back_populates="project",
        cascade="all, delete-orphan"
    )