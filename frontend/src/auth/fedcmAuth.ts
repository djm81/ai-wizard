import { ENV } from 'config';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types/auth';
import { app } from '../config/firebase';
import { logger } from '../services/logging';
import type { GoogleOAuthResponse, GoogleAuthAPI } from '../types/google-auth';

const auth = getAuth(app);

interface GoogleClient {
  requestAccessToken: (options: { callback: (response: GoogleOAuthResponse) => void }) => void;
  access_token?: string;
}

let googleClient: GoogleClient | null = null;

export function setGoogleClient(client: GoogleClient) {
  googleClient = client;
}

export function initializeGoogleAuth(): Promise<void> {
  logger.info('Initializing Google Auth');
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      logger.info('Google Identity Services script loaded');
      resolve();
    };
    script.onerror = (error) => {
      logger.error('Failed to load Google Identity Services script', { error });
      reject(error);
    };
    document.body.appendChild(script);
  });
}

export async function signInWithGoogle(): Promise<User> {
  if (!window.google?.accounts?.oauth2) {
    await initializeGoogleAuth();
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Failed to initialize Google Auth');
    }
  }

  return new Promise((resolve, reject) => {
    try {
      logger.info('Initializing Google client', { clientId: ENV.PUBLIC_GOOGLE_CLIENT_ID });
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: ENV.PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response: GoogleOAuthResponse) => {
          if (response.error) {
            logger.error('Google Auth Error', { error: response.error });
            reject(new Error(response.error));
            return;
          }

          try {
            const credential = GoogleAuthProvider.credential(null, response.access_token);
            const userCredential = await signInWithCredential(auth, credential);
            googleClient = {
              requestAccessToken: tokenClient.requestAccessToken,
              access_token: response.access_token
            };
            logger.info('Successfully signed in with Firebase');
            resolve(convertFirebaseUserToUser(userCredential.user));
          } catch (error) {
            logger.error('Firebase Auth Error', { error });
            reject(error);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      logger.error('Error initializing Google client', { error });
      reject(error);
    }
  });
}

export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
    if (googleClient?.access_token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(googleClient.access_token, () => {
        logger.info('Google token revoked');
      });
    }
  } catch (error) {
    logger.error('Error signing out', { error });
    throw error;
  }
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

function convertFirebaseUserToUser(firebaseUser: FirebaseUser): User {
  return {
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    uid: firebaseUser.uid
  };
}
