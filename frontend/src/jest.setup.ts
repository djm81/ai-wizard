import '@testing-library/jest-dom';
import type { Auth, User as FirebaseUser, NextOrObserver, AuthCredential } from 'firebase/auth';

// Create mock Firebase user first
const mockFirebaseUser: FirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00Z',
    lastSignInTime: '2024-01-01T00:00:00Z'
  },
  providerData: [{
    providerId: 'google.com',
    uid: 'test-uid',
    displayName: 'Test User',
    email: 'test@example.com',
    phoneNumber: null,
    photoURL: 'https://example.com/photo.jpg'
  }],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  phoneNumber: null,
  providerId: 'google.com',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-id-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'google.com',
    claims: {},
    signInSecondFactor: null
  }),
  reload: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  toJSON: jest.fn().mockReturnValue({}),
};

// Make mockFirebaseUser available globally
(global as any).mockFirebaseUser = mockFirebaseUser;

// Mock import.meta.env
const env = {
  PUBLIC_API_URL: 'http://localhost:8000/api',
  PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
  PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
  PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
  PUBLIC_FIREBASE_APP_ID: 'test-app-id',
  PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id'
};

// Mock Firebase configuration
const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID
};

// Mock Firebase App initialization
jest.mock('firebase/app', () => {
  const firebaseApp = {
    name: '[DEFAULT]',
    options: firebaseConfig,
    automaticDataCollectionEnabled: false
  };
  return {
    initializeApp: jest.fn().mockReturnValue(firebaseApp),
    getApp: jest.fn().mockReturnValue(firebaseApp),
    deleteApp: jest.fn().mockResolvedValue(undefined)
  };
});

// Create a function to get a fresh mockAuth instance
const getMockAuth = (currentUser: FirebaseUser | null = mockFirebaseUser) => ({
  currentUser,
  languageCode: 'en',
  settings: { appVerificationDisabledForTesting: true },
  onAuthStateChanged: jest.fn((nextOrObserver: NextOrObserver<FirebaseUser | null>) => {
    if (typeof nextOrObserver === 'function') {
      nextOrObserver(currentUser);
    } else {
      nextOrObserver.next?.(currentUser);
    }
    return jest.fn(); // unsubscribe
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  updateCurrentUser: jest.fn().mockResolvedValue(undefined),
  useDeviceLanguage: jest.fn()
} as Partial<Auth>);

// Initial mockAuth instance
let mockAuth = getMockAuth();

// Update the Firebase auth mock
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockImplementation(() => mockAuth),
  signInWithCredential: jest.fn().mockResolvedValue({ user: mockFirebaseUser }),
  signInWithPopup: jest.fn().mockResolvedValue({ user: mockFirebaseUser }),
  signInWithRedirect: jest.fn().mockResolvedValue(undefined),
  getRedirectResult: jest.fn().mockResolvedValue({ user: mockFirebaseUser }),
  GoogleAuthProvider: {
    PROVIDER_ID: 'google.com',
    credential: jest.fn().mockReturnValue({
      providerId: 'google.com',
      signInMethod: 'google.com',
      toJSON: () => ({
        providerId: 'google.com',
        signInMethod: 'google.com',
        accessToken: 'mock_token'
      })
    } satisfies AuthCredential),
    addScope: jest.fn(),
    setCustomParameters: jest.fn()
  },
  onAuthStateChanged: jest.fn().mockImplementation((auth, nextOrObserver) => {
    if (typeof nextOrObserver === 'function') {
      nextOrObserver(mockFirebaseUser);
    } else {
      nextOrObserver.next?.(mockFirebaseUser);
    }
    return jest.fn(); // unsubscribe
  }),
  signOut: jest.fn().mockResolvedValue(undefined)
}));

// Mock Google Identity Services
Object.defineProperty(window, 'google', {
  value: {
    accounts: {
      id: {
        initialize: jest.fn().mockReturnValue({
          prompt: jest.fn().mockResolvedValue({ credential: 'mock-credential' })
        }),
        renderButton: jest.fn(),
        prompt: jest.fn()
      },
      oauth2: {
        initTokenClient: jest.fn().mockReturnValue({
          requestAccessToken: jest.fn((options) => {
            if (options?.callback) {
              options.callback({
                access_token: 'mock_token'
              });
            } else {
              throw new Error('No callback function provided');
            }
          })
        }),
        revoke: jest.fn((token, callback) => {
          if (callback) callback();
        }),
        initCodeClient: jest.fn(),
        hasGrantedAllScopes: jest.fn().mockReturnValue(true),
        hasGrantedAnyScope: jest.fn().mockReturnValue(true)
      }
    }
  },
  writable: true,
  configurable: true
});

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: { meta: { env } },
  writable: true
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Create a fresh mockAuth instance for each test
  mockAuth = getMockAuth();
});

afterEach(() => {
  jest.resetAllMocks();
});
