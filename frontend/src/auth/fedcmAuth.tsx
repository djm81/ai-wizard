import { ENV } from 'config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types/auth';

declare global {
    interface Window {
        google: any;
    }
}

// Initialize Firebase with ENV variables
const firebaseConfig = {
  apiKey: ENV.PUBLIC_FIREBASE_API_KEY,
  authDomain: ENV.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: ENV.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase config:', firebaseConfig); // For debugging

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface GoogleClient {
  requestAccessToken: (options: { callback: (response: { error?: string; access_token?: string }) => void }) => void;
  access_token?: string;
}

let googleClient: GoogleClient | null = null;

// export interface User {
//   displayName: string | null;
//   email: string | null;
//   photoURL: string | null;
//   uid: string;
// }

export function initializeGoogleAuth(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services script loaded');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Error loading Google Identity Services script:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
}

export async function signInWithGoogle(): Promise<User> {
  if (typeof window.google === 'undefined' || !window.google.accounts) {
    await initializeGoogleAuth();
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('Initializing Google client with Client ID:', ENV.PUBLIC_GOOGLE_CLIENT_ID);
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: ENV.PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response: { error?: string; access_token?: string }) => {
          if (response.error) {
            console.error('Google Auth Error:', response.error);
            reject(new Error(response.error));
            return;
          }

          console.log('Received access token from Google:', response.access_token);
          try {
            const credential = GoogleAuthProvider.credential(null, response.access_token);
            const userCredential = await signInWithCredential(auth, credential);
            console.log('Successfully signed in with Firebase');
            // Store the access token for later use
            googleClient = {
              requestAccessToken: tokenClient.requestAccessToken,
              access_token: response.access_token
            };
            resolve(convertFirebaseUserToUser(userCredential.user));
          } catch (error) {
            console.error('Error during Google authentication:', error);
            reject(error);
          }
        },
      });

      console.log('Requesting access token');
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Error initializing Google client:', error);
      reject(error);
    }
  });
}

export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
    console.log('Signed out from Firebase');
    // Revoke Google token
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.oauth2) {
      if (googleClient && googleClient.access_token) {
        window.google.accounts.oauth2.revoke(googleClient.access_token, () => {
          console.log('Google token revoked');
        });
      } else {
        console.error('No access token available to revoke');
      }
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getIdToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
}

function convertFirebaseUserToUser(firebaseUser: FirebaseUser): User {
  return {
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    uid: firebaseUser.uid
  };
}
