import os
import sys
import firebase_admin
from firebase_admin import credentials, auth, firestore
import logging

logger = logging.getLogger("pathfinder.firebase")

firebase_app = None
db_firestore = None

def get_firebase_app():
    global firebase_app, db_firestore
    if firebase_app is None:
        try:
            project_id = os.environ.get("FIREBASE_PROJECT_ID")
            client_email = os.environ.get("FIREBASE_CLIENT_EMAIL")
            private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
            
            if project_id and client_email and private_key:
                logger.info("Initializing Firebase Admin SDK using environment variables...")
                # Normalize private key newlines and quotes
                private_key = private_key.replace("\\n", "\n").strip('"').strip("'")
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key": private_key,
                    "client_email": client_email,
                    "token_uri": "https://oauth2.googleapis.com/token",
                })
                firebase_app = firebase_admin.initialize_app(cred)
                db_firestore = firestore.client()
            else:
                logger.warning("Firebase Admin credentials not fully configured in environment. Attempting default app initialization...")
                try:
                    # Try default credentials (e.g. from local keyfile if configured via GOOGLE_APPLICATION_CREDENTIALS)
                    firebase_app = firebase_admin.initialize_app()
                    db_firestore = firestore.client()
                except Exception as e:
                    logger.warning(f"Firebase default initialization failed: {e}. Secure mock authentication will be enabled for tests.")
        except Exception as e:
            logger.error(f"Error during Firebase Admin SDK initialization: {e}")
            
    return firebase_app

def get_firestore_client():
    get_firebase_app()
    return db_firestore
