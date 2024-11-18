from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.db.init_db import init_db
from app.db.database import setup_database
from app.utils.logging_config import logger
import time
import yaml
from pathlib import Path

# Initialize Firebase Admin SDK
initialize_firebase()

# Create FastAPI app
app = FastAPI(
    title="AI Wizard API",
    description="API for AI-powered development assistance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

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
            f"- Error: {str(e)}",
            exc_info=True
        )
        raise

# Include routers without /api prefix since we're using api.domain.com
app.include_router(router)

@app.on_event("startup")
async def generate_openapi_spec():
    """Generate OpenAPI specification file on startup"""
    openapi_spec = app.openapi()
    openapi_spec['openapi'] = '3.0.2'  # Ensure API Gateway compatibility
    
    # Only write to app directory, let deployment pipeline handle terraform spec
    app_spec_dir = Path(__file__).parent / "openapi"
    app_spec_dir.mkdir(exist_ok=True)
    with open(app_spec_dir / "specification.yaml", "w") as f:
        yaml.dump(openapi_spec, f, sort_keys=False)

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the AI Wizard API"}

@app.get("/test-auth")
async def test_auth(request: Request):
    """Test endpoint to verify authorization header handling"""
    auth_header = request.headers.get('Authorization', '')
    logger.info(f"Auth test endpoint accessed")
    logger.debug(f"Authorization header present: {'Authorization' in request.headers}")
    return {
        "message": "Auth test endpoint",
        "auth_header_present": bool(auth_header),
        "auth_scheme": auth_header.split()[0] if ' ' in auth_header else 'No scheme'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
