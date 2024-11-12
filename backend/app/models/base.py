from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, Mapped
from datetime import datetime, UTC
from typing import Optional

class Base(DeclarativeBase):
    """Base class for all models"""
    
    @declared_attr
    def created_at(cls) -> Mapped[datetime]:
        return Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    
    @declared_attr
    def updated_at(cls) -> Mapped[datetime]:
        return Column(DateTime(timezone=True), 
                     default=lambda: datetime.now(UTC), 
                     onupdate=lambda: datetime.now(UTC), 
                     nullable=False)