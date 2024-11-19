"""init_db module for AI Wizard backend."""

import logging

from app.db.database import SessionLocal, engine
from app.models.base import Base

logger = logging.getLogger(__name__)


def init_db():
    """Initialize database and create all tables"""
    try:
        # Create all tables using the existing engine
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Return the existing SessionLocal
        return SessionLocal
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise