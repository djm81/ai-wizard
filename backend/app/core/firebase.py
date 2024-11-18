"""firebase module for AI Wizard backend."""

import logging
from pathlib import Path

import firebase_admin
from firebase_admin import credentials

logger = logging.getLogger(__name__)


def initialize_firebase() -> None:
    """Initialize Firebase Admin SDK with credentials."""
    try:
        cred_path = Path("config/firebase-adminsdk.json")
        if not cred_path.exists():
            msg = (
                "Firebase credentials file not found at config/firebase-adminsdk.json. "
                "Please ensure firebase-adminsdk.json is present in the config directory."
            )
            raise FileNotFoundError(msg) from None

        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")

    except ValueError as e:
        logger.error("Failed to initialize Firebase: %s", e)
        raise
