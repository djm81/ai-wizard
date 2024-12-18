import json
import time
import uuid
from typing import Any, Dict

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging_config import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Use frontend request ID if available, otherwise generate new one
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Create a request-specific logger with context
        log = logger.bind(
            request_id=request_id,
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host,
            source=request.headers.get("X-Source", "backend")
        )

        # Start timing
        start_time = time.time()

        # Extract request details
        request_details = {
            "path_params": request.path_params,
            "query_params": dict(request.query_params),
            "headers": dict(request.headers)
        }

        # Log request
        log.info("incoming_request", **request_details)

        try:
            # Get response
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            log.info(
                "outgoing_response",
                status_code=response.status_code,
                duration=duration,
                response_headers=dict(response.headers)
            )

            # Add correlation headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = str(duration)

            return response

        except Exception as e:
            log.error(
                "request_failed",
                error=str(e),
                duration=time.time() - start_time,
                exc_info=True
            )
            raise
