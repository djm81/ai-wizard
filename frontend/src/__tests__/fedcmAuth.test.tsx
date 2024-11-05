import { 
  getAuth, 
  signInWithCredential, 
  signOut, 
  getIdToken,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction, getIdToken as getIdTokenFunction } from '../auth/fedcmAuth';
import { mockAuthUser } from '../__mocks__/auth/fedcmAuth';
import type { User } from '../types/auth';

// Mock the modules
jest.mock('firebase/auth');

describe('fedcmAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getAuth to use our mockFirebaseUser from jest.setup.ts
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: (global as any).mockFirebaseUser,
      signOut: jest.fn().mockResolvedValue(undefined)
    } as unknown as Auth);

    // Mock Firebase auth responses
    (signInWithCredential as jest.Mock).mockResolvedValue({
      user: (global as any).mockFirebaseUser
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    // Initialize auth before testing
    await initializeGoogleAuth();
    
    const user = await signInWithGoogle();

    // Verify that the global mock from jest.setup.ts was used
    expect(window.google.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
      client_id: expect.any(String),
      scope: 'email profile',
      callback: expect.any(Function)
    });

    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        providerId: 'google.com',
        signInMethod: 'google.com'
      })
    );
    expect(user).toEqual(mockAuthUser);
  }, 10000);

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    // Set up the mock token client first
    window.google.accounts.oauth2.initTokenClient.mockReturnValueOnce({
      requestAccessToken: jest.fn(),
      access_token: 'mock_token'
    });

    await signOutFunction();
    expect(signOut).toHaveBeenCalled();
    expect(window.google.accounts.oauth2.revoke).toHaveBeenCalledWith(
      'mock_token',
      expect.any(Function)
    );
  });

  test('getIdToken returns null when no user is signed in', async () => {
    (getAuth as jest.Mock).mockReturnValueOnce({
      currentUser: null
    } as unknown as Auth);
    
    const token = await getIdTokenFunction();
    expect(token).toBeNull();
  });
});
