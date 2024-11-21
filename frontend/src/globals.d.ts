interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Define TokenClient interface
interface TokenClient {
  requestAccessToken: jest.Mock;
  access_token?: string;
}

// Define GoogleAuthAPI interface
interface GoogleAuthAPI {
  accounts: {
    oauth2: {
      initTokenClient: jest.Mock<TokenClient>;
      revoke: jest.Mock;
    };
  };
}

// Extend window interface globally
interface Window {
  google: GoogleAuthAPI;
}

// Extend global for Firebase mock
declare global {
  var mockFirebaseUser: import('firebase/auth').User;
}
