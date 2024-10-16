import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin
from firebase_admin import credentials, auth

# Pfad zur firebase-adminsdk.json Datei
current_dir = os.path.dirname(os.path.abspath(__file__))
firebase_config_path = os.path.abspath(os.path.join(current_dir, '..', 'config', 'firebase-adminsdk.json'))

# Initialisieren Sie den Firebase Admin SDK
cred = credentials.Certificate(firebase_config_path)
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))