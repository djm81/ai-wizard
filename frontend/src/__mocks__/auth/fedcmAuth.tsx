import type { User } from '../../types/auth';

// Create a mock user that matches our User type
const mockUser: User = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  uid: 'test-uid'
};

// Ensure all async functions return Promises
export const initializeGoogleAuth = jest.fn().mockResolvedValue(Promise.resolve());

export const signInWithGoogle = jest.fn().mockResolvedValue(Promise.resolve(mockUser));

export const signOut = jest.fn().mockResolvedValue(Promise.resolve());

export const getIdToken = jest.fn().mockResolvedValue(Promise.resolve('mock-id-token'));

// Export mock user for tests
export const mockAuthUser = mockUser;
