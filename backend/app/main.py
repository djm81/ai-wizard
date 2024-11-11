from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.config import settings
import logging
import time

# Configure logging
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Wizard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGINS] if settings.ALLOWED_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log request and response details"""
    start_time = time.time()
    
    # Log request details
    logger.info(f"Request started: {request.method} {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        
        # Calculate request processing time
        process_time = time.time() - start_time
        
        # Log response details
        logger.info(
            f"Request completed: {request.method} {request.url} "
            f"- Status: {response.status_code} "
            f"- Duration: {process_time:.3f}s"
        )
        
        return response
    except Exception as e:
        logger.error(
            f"Request failed: {request.method} {request.url} "
            f"- Error: {str(e)}"
        )
        raise

# Include routers
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the AI Wizard API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
