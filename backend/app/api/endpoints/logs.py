from typing import Any, Optional

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel, Field

from app.core.logging_config import logger

router = APIRouter()

class LogEntry(BaseModel):
    timestamp: str
    requestId: str
    level: str = Field(..., pattern='^(info|error)$')
    message: str
    method: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[float] = None
    status: Optional[int] = None
    error: Optional[Any] = None
    source: str = Field(..., pattern='^frontend$')
    environment: str

@router.post("")
async def create_log(log_entry: LogEntry):
    """
    Receive logs from frontend and forward to logging infrastructure
    """
    try:
        # Add any additional context and process
        log = logger.bind(request_id=log_entry.requestId)

        # Filter out None values from the log entry
        log_data = {k: v for k, v in log_entry.model_dump().items() if v is not None}

        log.info(
            log_entry.message,
            **log_data
        )
        return {"status": "logged"}
    except Exception as e:
        # Use proper structlog error format
        log = logger.bind(request_id=log_entry.requestId)

        # Filter out None values for error logging too
        log_data = {k: v for k, v in log_entry.model_dump().items() if v is not None}

        log.error(
            "Failed to process frontend log",
            error=str(e),
            log_data=log_data,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to process log entry"
        )
