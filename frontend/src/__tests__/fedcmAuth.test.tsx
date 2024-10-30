import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from '../auth/fedcmAuth';
import type { User } from '../types/auth';

// Create mock functions that we can track
const mockCredential = jest.fn();
const mockSignInWithCredential = jest.fn();
const mockSignOut = jest.fn();
const mockGetAuth = jest.fn();
const mockGetIdToken = jest.fn();

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockGetAuth()),
  signInWithCredential: (auth: unknown, credential: unknown) => mockSignInWithCredential(auth, credential),
  GoogleAuthProvider: {
    credential: (idToken: string | null, accessToken: string | null) => mockCredential(idToken, accessToken)
  }
}));

interface GoogleCallback {
  callback: (response: { access_token: string }) => void;
}

describe('fedcmAuth', () => {
  let appendChildSpy: jest.SpyInstance;
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    mockCredential.mockReturnValue({ type: 'google.com' });
    mockSignInWithCredential.mockResolvedValue({
      user: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        getIdToken: mockGetIdToken
      }
    });
    mockSignOut.mockResolvedValue(undefined);
    mockGetAuth.mockReturnValue({ 
      signOut: mockSignOut, 
      currentUser: null 
    });
    mockGetIdToken.mockResolvedValue(null);

    // Mock global google object
    (global as any).google = {
      accounts: {
        oauth2: {
          initTokenClient: jest.fn().mockReturnValue({
            requestAccessToken: jest.fn((options: GoogleCallback) => {
              setTimeout(() => {
                options.callback({ access_token: 'mock_token' });
              }, 0);
            }),
          }),
          revoke: jest.fn((_token: string, callback: () => void) => {
            setTimeout(callback, 0);
          }),
        },
      },
    };

    // Mock document functions
    const mockScript = document.createElement('script');
    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    createElementSpy = jest.spyOn(document, 'createElement');
    
    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === 'script') {
        setTimeout(() => {
          if (mockScript.onload) {
            mockScript.onload(new Event('load'));
          }
        }, 0);
        return mockScript;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    appendChildSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  test('initializeGoogleAuth loads Google Identity Services script', async () => {
    const promise = initializeGoogleAuth();
    await promise;
    expect(createElementSpy).toHaveBeenCalledWith('script');
    expect(appendChildSpy).toHaveBeenCalled();
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    const user = await signInWithGoogle();

    expect(mockCredential).toHaveBeenCalledWith(null, 'mock_token');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'google.com' })
    );
    expect(user).toEqual({
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    } as User);
  });

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    mockGetAuth.mockReturnValueOnce({ signOut: mockSignOut });
    await signOut();
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('getIdToken returns null when no user is signed in', async () => {
    mockGetAuth.mockReturnValueOnce({ currentUser: null });
    const token = await getIdToken();
    expect(token).toBeNull();
  });
});