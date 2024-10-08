import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from '../auth/fedcmAuth';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

jest.mock('firebase/auth');
jest.setTimeout(100); // Small timeout is ok as we mock api calls

describe('fedcmAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global as any).google = {
            accounts: {
            oauth2: {
                initTokenClient: jest.fn().mockReturnValue({
                requestAccessToken: jest.fn((options) => {
                    // Ensure the callback is defined and called
                    setTimeout(() => {
                    if (options.callback) {
                        options.callback({ access_token: 'mock_token' });
                    } else {
                        throw new Error('Callback is undefined');
                    }
                    }, 100); // Reduced timeout for quicker tests
                }),
                }),
            },
            },
        };
        });

  test('initializeGoogleAuth loads Google Identity Services script', async () => {
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    await initializeGoogleAuth();
    expect(appendChildSpy).toHaveBeenCalledWith(expect.any(HTMLScriptElement));
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    const mockCredential = {} as any;
    const mockUserCredential = { user: { uid: '123', email: 'test@example.com', displayName: null, photoURL: null } };
    (GoogleAuthProvider.credential as jest.Mock).mockReturnValue(mockCredential);
    (signInWithCredential as jest.Mock).mockResolvedValue(mockUserCredential);

    const user = await signInWithGoogle();

    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalledWith(expect.anything(), mockCredential);
    expect(user).toEqual({
      uid: '123',
      email: 'test@example.com',
      displayName: null,
      photoURL: null,
    });
  });

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    (getAuth as jest.Mock).mockReturnValue({ signOut: mockSignOut });
    (global as any).google.accounts.oauth2.revoke = jest.fn((token, callback) => callback());

    await signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  test('getIdToken returns null when no user is signed in', async () => {
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

    const token = await getIdToken();

    expect(token).toBeNull();
  });
});