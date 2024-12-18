// Setup mocks before any imports
jest.mock('firebase/auth');
jest.mock('../config/firebase');

// Import dependencies after mocks
import { createAuthMocks } from '../__mocks__/auth/mockFactory';
import type { GoogleTokenClient } from '../types/google-auth';

const { mockRequestAccessToken, mockSignInWithCredential } = createAuthMocks();

// Mock Google API synchronously
global.window.google = {
  accounts: {
    oauth2: {
      initTokenClient: () => ({
        requestAccessToken: mockRequestAccessToken
      } satisfies GoogleTokenClient)
    }
  }
} as any;

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    signInWithCredential: mockSignInWithCredential
  }),
  GoogleAuthProvider: {
    credential: jest.fn().mockReturnValue('mock-credential')
  }
}));

// Now import tested module
import { signInWithGoogle } from '../auth/fedcmAuth';

describe('fedcmAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles Google sign-in flow', async () => {
    await signInWithGoogle();

    expect(mockRequestAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        callback: expect.any(Function)
      })
    );
  });
});
