from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from app.core.config import settings
from typing import Generator
from fastapi import Depends

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Get a database session.
    
    Returns:
        Generator[Session, None, None]: A database session that will be automatically closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()