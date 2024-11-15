import firebase_admin
from firebase_admin import credentials
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
        logger.info("Firebase Admin SDK already initialized")
    except ValueError:
        # Get the path to the service account file
        cred_path = Path(__file__).parent.parent / "config" / "firebase-adminsdk.json"
        
        if not cred_path.exists():
            raise FileNotFoundError(
                f"Firebase credentials file not found at {cred_path}. "
                "Please ensure firebase-adminsdk.json is present in the config directory."
            )
            
        try:
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
            raise 