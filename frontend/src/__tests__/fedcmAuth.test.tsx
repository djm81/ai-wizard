import { 
  getAuth, 
  signInWithCredential, 
  signOut, 
  getIdToken,
  GoogleAuthProvider,
  Auth,
  OAuthCredential,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction, getIdToken as getIdTokenFunction, setGoogleClient } from '../auth/fedcmAuth';
import type { User } from '../types/auth';

// Ensure Jest uses the manual mock
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
            revoke: jest.fn()
          }
        }
      },
      writable: true
    });

    // Cast signInWithCredential as a Jest mocked function
    const mockedSignInWithCredential = signInWithCredential as jest.MockedFunction<typeof signInWithCredential>;
    mockedSignInWithCredential.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        phoneNumber: null,
        providerId: 'google.com'
      } as FirebaseUser,
      providerId: 'google.com',
      operationType: 'signIn'
    } as unknown as UserCredential);

    // Cast GoogleAuthProvider.credential as a Jest mocked function
    const mockedCredential = GoogleAuthProvider.credential as jest.MockedFunction<typeof GoogleAuthProvider.credential>;
    mockedCredential.mockReturnValue({
      providerId: 'google.com',
      signInMethod: 'google.com'
    } as OAuthCredential);
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    const user = await signInWithGoogle();

    const mockedCredential = GoogleAuthProvider.credential as jest.MockedFunction<typeof GoogleAuthProvider.credential>;
    const mockedSignInWithCredential = signInWithCredential as jest.MockedFunction<typeof signInWithCredential>;

    expect(mockedCredential).toHaveBeenCalledWith(null, 'mock_token');
    expect(mockedSignInWithCredential).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        providerId: 'google.com',
        signInMethod: 'google.com'
      })
    );
    expect(user).toEqual({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    } as User);
  });

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
    mockedSignOut.mockResolvedValueOnce(undefined);

    // Set the access token in googleClient
    setGoogleClient({
      requestAccessToken: jest.fn(),
      access_token: 'mock_token'
    });

    const mockedRevoke = window.google.accounts.oauth2.revoke as jest.MockedFunction<typeof window.google.accounts.oauth2.revoke>;

    await signOutFunction();

    expect(mockedSignOut).toHaveBeenCalled();
    expect(mockedRevoke).toHaveBeenCalledWith('mock_token', expect.any(Function));
  });

  test('getIdToken returns null when no user is signed in', async () => {
    const mockedGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
    mockedGetAuth.mockReturnValueOnce({
      currentUser: null,
      signOut: signOut
      // Mock other necessary methods if used
    } as unknown as Auth);
    
    const token = await getIdTokenFunction();
    expect(token).toBeNull();
  });
});
