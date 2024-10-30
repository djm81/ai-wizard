import type { User } from '../../types/auth';

export const mockUser: User = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  uid: 'test-uid'
};

export const initializeGoogleAuth = jest.fn().mockResolvedValue(undefined);
export const signInWithGoogle = jest.fn().mockResolvedValue(mockUser);
export const signOut = jest.fn().mockResolvedValue(undefined);
export const getIdToken = jest.fn().mockResolvedValue('test-token');