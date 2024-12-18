import { mockApp } from '../__mocks__/firebase/app';

// Setup mocks
jest.mock('../config/firebase', () => ({
  app: mockApp
}));

// Mock ENV to match mockApp values
jest.mock('../config', () => ({
  ENV: {
    PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
    PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
    PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
    PUBLIC_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'mock-messaging-sender-id',
    PUBLIC_FIREBASE_APP_ID: 'mock-app-id'
  }
}));

describe('Firebase Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes Firebase with correct config', () => {
    expect(mockApp.options).toEqual({
      apiKey: 'mock-api-key',
      authDomain: 'mock-auth-domain',
      projectId: 'mock-project-id',
      storageBucket: 'mock-storage-bucket',
      messagingSenderId: 'mock-messaging-sender-id',
      appId: 'mock-app-id'
    });
  });
});
