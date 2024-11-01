import '@testing-library/jest-dom';
import { mockAuthInstance } from './__mocks__/firebase/auth';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset auth state
  Object.assign(mockAuthInstance, {
    currentUser: null,
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback(null);
      return () => {};
    })
  });
});

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

Object.defineProperty(global, 'import', {
  value: { meta: { env } },
  writable: true
});
