import { 
  getAuth, 
  signInWithCredential, 
  signOut, 
  getIdToken,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction, getIdToken as getIdTokenFunction, setGoogleClient } from '../auth/fedcmAuth';
import { mockAuthUser } from '../__mocks__/auth/fedcmAuth';
import type { User } from '../types/auth';

// Mock the modules
jest.mock('firebase/auth');

describe('fedcmAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.google synchronously
    Object.defineProperty(window, 'google', {
      value: {
        accounts: {
          oauth2: {
            initTokenClient: jest.fn().mockReturnValue({
              requestAccessToken: jest.fn((options) => {
                if (options?.callback) {
                  options.callback({ access_token: 'mock_token' });
                }
              })
            }),
            revoke: jest.fn((token, callback) => {
              if (callback) callback();
            })
          }
        }
      },
      writable: true,
      configurable: true
    });

    // Set up mock token client
    setGoogleClient({
      requestAccessToken: jest.fn(),
      access_token: 'mock_token'
    });

    // Mock Firebase auth responses
    (signInWithCredential as jest.Mock).mockResolvedValue({
      user: mockAuthUser
    });

    (GoogleAuthProvider.credential as jest.Mock).mockReturnValue({
      providerId: 'google.com',
      signInMethod: 'google.com'
    });

    // Mock getAuth
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: mockAuthUser,
      signOut: jest.fn().mockResolvedValue(undefined)
    } as unknown as Auth);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    const user = await signInWithGoogle();

    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        providerId: 'google.com',
        signInMethod: 'google.com'
      })
    );
    expect(user).toEqual(mockAuthUser);
  });

  test('signOut calls Firebase signOut and revokes Google token', async () => {
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
