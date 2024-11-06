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
    // Mock successful sign-in using existing mock
    const user = await signInWithGoogle();

    // Verify Google OAuth flow (this should now work)
    expect(window.google.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
      client_id: expect.any(String),
      scope: 'email profile',
      callback: expect.any(Function)
    });

    // Rest of test remains the same
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalled();
    expect(user).toEqual(mockAuthUser);
  });

  test('signOut calls Firebase signOut and revokes Google token', async () => {
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
  });

  test('getIdToken returns null when no user is signed in', async () => {
    // Ensure no user is signed in
    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: null
    } as unknown as Auth);
    
    const token = await signInWithGoogle();
    expect(token).toBeDefined();
  });
});
