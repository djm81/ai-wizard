import type { User, Auth, AuthCredential, NextOrObserver } from 'firebase/auth';

// Create a mock user with all required properties
const mockUser: User = {
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
};

// Create a mock auth instance with proper unsubscribe function
const unsubscribe = jest.fn();

// Create a mutable auth state
let currentUser: User | null = mockUser;

// Create the mock auth instance
const mockAuth = {
  get currentUser() { return currentUser; },
  onAuthStateChanged: jest.fn((nextOrObserver: NextOrObserver<User | null>) => {
    if (typeof nextOrObserver === 'function') {
      setTimeout(() => nextOrObserver(currentUser), 0);
    } else {
      setTimeout(() => nextOrObserver.next?.(currentUser), 0);
    }
    return unsubscribe;
  }),
  signOut: jest.fn().mockResolvedValue(undefined)
} as unknown as Auth;

// Export functions that return consistent values
export const getAuth = jest.fn().mockReturnValue(mockAuth);
export const signInWithCredential = jest.fn().mockResolvedValue({ user: mockUser });
export const signOut = jest.fn().mockResolvedValue(undefined);
export const getIdToken = jest.fn().mockResolvedValue('mock-token');

export const GoogleAuthProvider = {
  credential: jest.fn().mockReturnValue({
    providerId: 'google.com',
    signInMethod: 'google.com'
  } as AuthCredential)
};

// Export for test manipulation
export const mockAuthInstance = mockAuth;
export const mockFirebaseUser = mockUser;
export const mockUnsubscribe = unsubscribe;

// Reset function for tests that updates the mutable state
export const resetMockAuth = (user: User | null = mockUser) => {
  currentUser = user;
  (mockAuth.onAuthStateChanged as jest.Mock).mockImplementation((nextOrObserver: NextOrObserver<User | null>) => {
    if (typeof nextOrObserver === 'function') {
      setTimeout(() => nextOrObserver(currentUser), 0);
    } else {
      setTimeout(() => nextOrObserver.next?.(currentUser), 0);
    }
    return unsubscribe;
  });
};