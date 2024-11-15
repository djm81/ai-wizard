from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
import logging
from contextvars import ContextVar
from typing import Optional, AsyncGenerator
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI

logger = logging.getLogger(__name__)

# Context variable to track database sessions per request
request_session: ContextVar[Optional[Session]] = ContextVar('request_session', default=None)

# Create database engine with proper thread handling
engine = create_engine(
    settings.DATABASE_URL,
    # Only add thread handling for SQLite
    connect_args={
        "check_same_thread": False
    } if settings.DATABASE_URL.startswith("sqlite") else {},
    # Add pooling configuration for better thread handling
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    # Ensure sessions are scoped to avoid thread issues
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[Session, None]:
    """Get database session with proper thread handling"""
    session = None
    try:
        # Try to get existing session from context
        session = request_session.get()
        if session is not None:
            yield session
            return
            
        # Create new session if none exists
        session = SessionLocal()
        # Store in context
        request_session.set(session)
        yield session
    except Exception as e:
        logger.error(f"Error creating database session: {str(e)}")
        raise
    finally:
        try:
            if session:
                session.close()
                request_session.set(None)
        except Exception as e:
            logger.error(f"Error closing database session: {str(e)}")

class DBSessionMiddleware(BaseHTTPMiddleware):
    """Middleware to ensure proper database session handling"""
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        finally:
            session = request_session.get(None)
            if session:
                session.close()
                request_session.set(None)

def setup_database(app: FastAPI):
    """Setup database with proper middleware"""
    app.add_middleware(DBSessionMiddleware)