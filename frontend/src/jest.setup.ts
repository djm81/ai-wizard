import '@testing-library/jest-dom';
import { authMock, mockFunctions, mockFirebaseUser } from './__mocks__/auth';

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

// Mock fedcmAuth - this is the key fix
jest.mock('./auth/fedcmAuth', () => ({
  __esModule: true,
  initializeGoogleAuth: mockFunctions.initializeGoogleAuth,
  signInWithGoogle: mockFunctions.signInWithGoogle,
  signOut: mockFunctions.signOut,
  getIdToken: mockFunctions.getIdToken,
  default: mockFunctions
}));

beforeEach(() => {
  jest.clearAllMocks();
  // Reset auth state
  if (authMock.auth?.updateCurrentUser) {
    authMock.auth.updateCurrentUser(null);
  }
  // Reset mock functions
  Object.values(mockFunctions).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear();
    }
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
