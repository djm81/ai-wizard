import type { User } from '../../types/auth';

// Use the global mock Firebase user
const mockFirebaseUser = (global as any).mockFirebaseUser;

// Create a mock user that matches our User type
export const mockAuthUser: User = {
  displayName: mockFirebaseUser.displayName,
  email: mockFirebaseUser.email,
  photoURL: mockFirebaseUser.photoURL,
  uid: mockFirebaseUser.uid
};

// Mock the Google Auth initialization with complete implementation
export const initializeGoogleAuth = jest.fn().mockImplementation(() => {
  // Simulate script loading and initialization
  return Promise.resolve();
});

// Mock Google client with complete interface
const mockGoogleClient = {
  requestAccessToken: jest.fn((options) => {
    if (options?.callback) {
      options.callback({
        access_token: 'mock_token'
        // Only include access_token as that's all the type expects
      });
    }
  }),
  revokeAccessToken: jest.fn().mockResolvedValue(undefined),
  error: null,
  access_token: 'mock_token'
};

// Mock functions with complete implementations
export const signInWithGoogle = jest.fn().mockImplementation(async () => {
  // Return the mock user immediately for tests
  return mockAuthUser;
});

export const signOut = jest.fn().mockImplementation(async () => {
  // Return immediately for tests
  return undefined;
});

export const getIdToken = jest.fn().mockImplementation(async () => {
  // Return mock token immediately for tests
  return 'mock-token';
});

export const setGoogleClient = jest.fn().mockImplementation((client) => {
  Object.assign(mockGoogleClient, client);
});

// Export additional utilities for testing
export const mockFunctions = {
  initializeGoogleAuth,
  signInWithGoogle,
  signOut,
  getIdToken,
  setGoogleClient,
  mockGoogleClient
};

// Export for use in tests
export { mockGoogleClient };
