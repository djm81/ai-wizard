/* global google */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

// Initialize Firebase (make sure to replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let googleClient;

export function initializeGoogleAuth() {
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

export async function signInWithGoogle() {
  if (typeof google === 'undefined' || !google.accounts) {
    await initializeGoogleAuth();
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('Initializing Google client with Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
      googleClient = google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            console.error('Google Auth Error:', response.error);
            reject(new Error(response.error));
            return;
          }

          console.log('Received access token from Google');
          try {
            const credential = GoogleAuthProvider.credential(null, response.access_token);
            const userCredential = await signInWithCredential(auth, credential);
            console.log('Successfully signed in with Firebase');
            resolve(userCredential.user);
          } catch (error) {
            console.error('Error during Google authentication:', error);
            reject(error);
          }
        },
      });

      console.log('Requesting access token');
      googleClient.requestAccessToken();
    } catch (error) {
      console.error('Error initializing Google client:', error);
      reject(error);
    }
  });
}

export async function signOut() {
  try {
    await auth.signOut();
    console.log('Signed out from Firebase');
    // Revoke Google token
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(googleClient.access_token, () => {
        console.log('Google token revoked');
      });
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}