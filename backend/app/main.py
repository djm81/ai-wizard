from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.core.logging_config import setup_logging
from app.db.init_db import init_db
from app.db.database import setup_database
import logging
import time

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
initialize_firebase()

# Create FastAPI app
app = FastAPI(title="AI Wizard API")

# Setup database and create tables
setup_database(app)
init_db()

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

@app.get("/test-auth")
async def test_auth(request: Request):
    """Test endpoint to verify authorization header handling"""
    auth_header = request.headers.get('Authorization', '')
    logger.info(f"Received Authorization header: {auth_header}")
    return {
        "message": "Auth test endpoint",
        "auth_header": auth_header,
        "auth_scheme": auth_header.split()[0] if ' ' in auth_header else 'No scheme'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
