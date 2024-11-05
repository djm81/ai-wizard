import { 
  getAuth, 
  signInWithCredential, 
  signOut, 
  getIdToken,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import { initializeGoogleAuth, signInWithGoogle, signOut as signOutFunction, getIdToken as getIdTokenFunction } from '../auth/fedcmAuth';
import { mockAuthUser, mockFirebaseUser, googleAuthMock } from '../__mocks__/auth';
import type { User } from '../types/auth';

// Mock the modules
jest.mock('firebase/auth');

// Define TokenClient interface
interface TokenClient {
  requestAccessToken: jest.Mock;
  access_token?: string;
}

// Define GoogleAuth interface
interface GoogleAuth {
  accounts: {
    oauth2: {
      initTokenClient: jest.Mock<TokenClient>;
      revoke: jest.Mock;
    };
  };
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google: GoogleAuth;
  }
}

describe('fedcmAuth', () => {
  let mockTokenClient: TokenClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Start with no user
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      signOut: jest.fn().mockResolvedValue(undefined)
    } as unknown as Auth);

    // Create mock token client with proper typing
    mockTokenClient = {
      requestAccessToken: jest.fn((options) => {
        if (options?.callback) {
          options.callback({ access_token: 'mock_token' });
        }
      }),
      access_token: 'mock_token'
    };

    // Use googleAuthMock from centralized mocks
    (window.google as GoogleAuthAPI).accounts.oauth2.initTokenClient.mockReturnValue(mockTokenClient);
  });

  test('signInWithGoogle calls Google OAuth and Firebase signInWithCredential', async () => {
    // Mock successful sign-in
    (signInWithCredential as jest.Mock).mockResolvedValueOnce({
      user: mockFirebaseUser
    });

    // Initialize auth before testing
    await initializeGoogleAuth();
    
    const user = await signInWithGoogle();

    // Verify token client initialization
    expect((window.google as GoogleAuthAPI).accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
      client_id: expect.any(String),
      scope: 'email profile',
      callback: expect.any(Function)
    });

    // Verify the complete auth flow
    expect(mockTokenClient.requestAccessToken).toHaveBeenCalled();
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith(null, 'mock_token');
    expect(signInWithCredential).toHaveBeenCalled();
    expect(user).toEqual(mockAuthUser);
  }, 15000);

  test('signOut calls Firebase signOut and revokes Google token', async () => {
    // Set up mock token
    mockTokenClient.access_token = 'mock_token';

    await signOutFunction();
    expect(signOut).toHaveBeenCalled();
    expect((window.google as GoogleAuthAPI).accounts.oauth2.revoke).toHaveBeenCalledWith(
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
