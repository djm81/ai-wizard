import type { Auth, User as FirebaseUser, NextOrObserver, AuthCredential, Unsubscribe } from 'firebase/auth';
import type { User } from '../../types/auth';

// Create mock Firebase user
export const mockFirebaseUser: FirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00Z',
    lastSignInTime: '2024-01-01T00:00:00Z'
  },
  providerData: [{
    providerId: 'google.com',
    uid: 'test-uid',
    displayName: 'Test User',
    email: 'test@example.com',
    phoneNumber: null,
    photoURL: 'https://example.com/photo.jpg'
  }],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  phoneNumber: null,
  providerId: 'google.com',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-id-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'google.com',
    claims: {},
    signInSecondFactor: null
  }),
  reload: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  toJSON: jest.fn().mockReturnValue({})
};

// Create mock auth user
export const mockAuthUser: User = {
  displayName: mockFirebaseUser.displayName,
  email: mockFirebaseUser.email,
  photoURL: mockFirebaseUser.photoURL,
  uid: mockFirebaseUser.uid
};

// Create auth mock instance with proper state management
const createAuthMock = () => {
  let internalCurrentUser: FirebaseUser | null = null;
  const listeners: Array<NextOrObserver<FirebaseUser | null>> = [];

  const notifyListeners = (user: FirebaseUser | null) => {
    listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(user);
      } else {
        listener.next?.(user);
      }
    });
  };

  return {
    auth: {
      get currentUser() {
        return internalCurrentUser;
      },
      onAuthStateChanged: jest.fn((nextOrObserver: NextOrObserver<FirebaseUser | null>): Unsubscribe => {
        listeners.push(nextOrObserver);
        if (typeof nextOrObserver === 'function') {
          nextOrObserver(internalCurrentUser);
        } else {
          nextOrObserver.next?.(internalCurrentUser);
        }
        return () => {
          const index = listeners.indexOf(nextOrObserver);
          if (index > -1) listeners.splice(index, 1);
        };
      }),
      signOut: jest.fn().mockImplementation((): Promise<void> => {
        internalCurrentUser = null;
        notifyListeners(null);
        return Promise.resolve();
      }),
      updateCurrentUser: jest.fn().mockImplementation((user: FirebaseUser | null): Promise<void> => {
        internalCurrentUser = user;
        notifyListeners(internalCurrentUser);
        return Promise.resolve();
      })
    } as Partial<Auth>
  };
};

// Create a single instance of auth mock
export const authMock = createAuthMock();

// Mock Google Identity Services
export const googleAuthMock: GoogleAuthAPI = {
  accounts: {
    oauth2: {
      initTokenClient: jest.fn().mockReturnValue({
        requestAccessToken: jest.fn((options) => {
          if (options?.callback) {
            setTimeout(() => options.callback({ access_token: 'mock_token' }), 0);
          }
        })
      }),
      revoke: jest.fn((token, callback) => {
        if (callback) setTimeout(callback, 0);
      })
    }
  }
};

// Export mock functions
export const mockFunctions = {
  signInWithGoogle: jest.fn().mockImplementation(async () => {
    await authMock.auth.updateCurrentUser?.(mockFirebaseUser);
    return mockAuthUser;
  }),
  signOut: jest.fn().mockImplementation(async () => {
    await authMock.auth.signOut?.();
  }),
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
  initializeGoogleAuth: jest.fn().mockResolvedValue(undefined)
};

// Setup global mocks
(global as any).mockFirebaseUser = mockFirebaseUser;
Object.defineProperty(window, 'google', {
  value: googleAuthMock,
  writable: true,
  configurable: true
});