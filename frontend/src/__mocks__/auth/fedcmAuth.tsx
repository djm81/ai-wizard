import type { User } from '../../types/auth';
import { mockFirebaseUser } from '../firebase/auth';

// Create a mock user that matches our User type
export const mockAuthUser: User = {
  displayName: mockFirebaseUser.displayName,
  email: mockFirebaseUser.email,
  photoURL: mockFirebaseUser.photoURL,
  uid: mockFirebaseUser.uid
};

// Mock functions that return consistent values
export const initializeGoogleAuth = jest.fn().mockResolvedValue(undefined);
export const signInWithGoogle = jest.fn().mockResolvedValue(mockAuthUser);
export const signOut = jest.fn().mockResolvedValue(undefined);
export const getIdToken = jest.fn().mockResolvedValue('mock-token');

// Mock the Google client
export const setGoogleClient = jest.fn();

// Export mock functions for tests
export const mockFunctions = {
  initializeGoogleAuth,
  signInWithGoogle,
  signOut,
  getIdToken,
  setGoogleClient
};
