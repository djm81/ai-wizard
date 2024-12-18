// Setup mocks before any imports
jest.mock('firebase/auth');
jest.mock('../config/firebase');

// Import dependencies after mocks
import { mockUser } from '../__mocks__/auth';
import type { UserCredential } from 'firebase/auth';
import type { User } from '../types/auth';

// Setup synchronous mocks
const mockCredential = jest.fn().mockReturnValue('mock-credential');

// Create expected converted user
const convertedUser: User = {
  displayName: mockUser.displayName,
  email: mockUser.email,
  photoURL: mockUser.photoURL,
  uid: mockUser.uid
};

const mockSignInWithCredential = jest.fn().mockResolvedValue({
  user: mockUser,
  operationType: 'signIn',
  providerId: 'google.com'
} as UserCredential);

// Mock Google API synchronously
Object.defineProperty(window, 'google', {
  value: {
    accounts: {
      oauth2: {
        initTokenClient: (config: any) => ({
          requestAccessToken: () => {
            config.callback({ access_token: 'test-token' });
          }
        })
      }
    }
  },
  writable: true
});

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    signInWithCredential: mockSignInWithCredential
  }),
  GoogleAuthProvider: {
    credential: mockCredential
  },
  signInWithCredential: mockSignInWithCredential
}));

import { signInWithGoogle } from '../auth/fedcmAuth';

describe('fedcmAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles Google sign-in flow', async () => {
    const result = await signInWithGoogle();

    expect(mockCredential).toHaveBeenCalledWith(null, 'test-token');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(
      expect.any(Object),
      'mock-credential'
    );
    expect(result).toEqual(convertedUser);
  });
});
