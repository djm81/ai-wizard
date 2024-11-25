"""base module for AI Wizard backend."""

from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, Integer, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all models"""

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        # pylint: disable=E1102
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        # pylint: disable=E1102
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __init__(self, **kwargs: Any) -> None:
        """Initialize a Base model instance."""
        for key, value in kwargs.items():
            setattr(self, key, value)
