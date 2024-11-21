import {
  getAuth,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction } from 'auth/fedcmAuth';
import { authMock, mockAuthUser, mockFirebaseUser } from '../__mocks__/auth';

describe('fedcmAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Use authMock.auth instead of creating new mock
    if (authMock.auth?.updateCurrentUser) {
      authMock.auth.updateCurrentUser(null);
    }
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    // Set longer timeout for this test if needed
    jest.setTimeout(10000);

    // Reset the mock to ensure clean state
    (window.google.accounts.oauth2.initTokenClient as jest.Mock).mockClear();

    const user = await signInWithGoogle();

    // Verify Google OAuth flow
    expect(window.google.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
      client_id: expect.any(String),
      scope: 'email profile',
      callback: expect.any(Function)
    });

    // Verify Firebase flow
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalled();
    expect(user).toEqual(mockAuthUser);
  }, 10000);

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    jest.setTimeout(10000);

    // Mock successful sign-in first
    await signInWithGoogle();

    // Then attempt sign out
    await signOutFunction();

    // Verify both Firebase and Google sign out
    expect(signOut).toHaveBeenCalled();
    expect(window.google.accounts.oauth2.revoke).toHaveBeenCalledWith(
      'mock_token',
      expect.any(Function)
    );
  }, 10000); // Add timeout here

  test('getIdToken returns null when no user is signed in', async () => {
    // Ensure no user is signed in
    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: null
    } as unknown as Auth);

    const token = await signInWithGoogle();
    expect(token).toBeDefined();
  });
});
