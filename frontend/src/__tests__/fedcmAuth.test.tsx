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
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction, getIdToken as getIdTokenFunction } from '../auth/fedcmAuth';
import type { User } from '../types/auth';

// Explicitly type the mocked functions
const mockedGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockedSignInWithCredential = signInWithCredential as jest.MockedFunction<typeof signInWithCredential>;
const mockedGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>;
const mockedGoogleProviderCredential = GoogleAuthProvider.credential as jest.MockedFunction<typeof GoogleAuthProvider.credential>;

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

    // Mock Firebase auth responses
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
    } as UserCredential);

    mockedGoogleProviderCredential.mockReturnValue({
      providerId: 'google.com',
      signInMethod: 'google.com'
    } as OAuthCredential);
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    const user = await signInWithGoogle();

    expect(mockedGoogleProviderCredential).toHaveBeenCalledWith(null, 'mock_token');
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
    mockedSignOut.mockResolvedValueOnce(undefined);
    await signOutFunction();
    expect(mockedSignOut).toHaveBeenCalled();
  });

  test('getIdToken returns null when no user is signed in', async () => {
    mockedGetAuth.mockReturnValueOnce({
      currentUser: null,
      signOut: mockedSignOut
    } as unknown as Auth);
    
    const token = await getIdTokenFunction();
    expect(token).toBeNull();
  });
});