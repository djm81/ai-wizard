import '@testing-library/jest-dom';
import { authMock, mockFunctions, mockFirebaseUser } from './__mocks__/auth';

// Use the mapped path 'auth/fedcmAuth' instead of relative path
jest.mock('auth/fedcmAuth', () => ({
  initializeGoogleAuth: jest.fn().mockResolvedValue(undefined),
  signInWithGoogle: jest.fn().mockResolvedValue(mockFirebaseUser),
  signOut: jest.fn().mockResolvedValue(undefined),
  getIdToken: jest.fn().mockResolvedValue('mock-token')
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => authMock.auth),
  signInWithCredential: jest.fn().mockImplementation(() => {
    const user = mockFirebaseUser;
    if (authMock.auth?.updateCurrentUser) {
      authMock.auth.updateCurrentUser(user);
    }
    return Promise.resolve({ user });
  }),
  onAuthStateChanged: authMock.auth.onAuthStateChanged,
  signOut: authMock.auth.signOut,
  GoogleAuthProvider: {
    PROVIDER_ID: 'google.com',
    credential: jest.fn(() => ({
      providerId: 'google.com',
      signInMethod: 'google.com',
      toJSON: () => ({
        providerId: 'google.com',
        signInMethod: 'google.com',
        accessToken: 'mock_token'
      })
    }))
  }
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset auth state
  if (authMock.auth?.updateCurrentUser) {
    authMock.auth.updateCurrentUser(null);
  }
});

afterEach(() => {
  jest.resetAllMocks();
});
