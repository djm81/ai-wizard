// frontend/src/__mocks__/firebase/auth.tsx

// Import necessary Firebase modules if needed (optional)
// import { GoogleAuthProvider } from 'firebase/auth';

// Mock implementations of Firebase Auth functions
import type { User, Auth, AuthCredential } from 'firebase/auth';

// Create a simple mock user with all required properties
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
  getIdToken: jest.fn().mockResolvedValue(Promise.resolve('mock-token')),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  phoneNumber: null,
  providerId: 'google.com'
};

// Create a simple mock auth with proper unsubscribe function
const unsubscribe = jest.fn();
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser); // Call with mock user
    return unsubscribe;
  }),
  signOut: jest.fn().mockResolvedValue(Promise.resolve())
} as unknown as Auth;

// Export simple mock functions
export const getAuth = jest.fn(() => mockAuth);
export const signInWithCredential = jest.fn().mockResolvedValue(Promise.resolve({ user: mockUser }));
export const signOut = jest.fn().mockResolvedValue(Promise.resolve());
export const getIdToken = jest.fn().mockResolvedValue(Promise.resolve('test-token'));

export const GoogleAuthProvider = {
  credential: jest.fn().mockReturnValue({
    providerId: 'google.com',
    signInMethod: 'google.com'
  } as AuthCredential)
};

// Export for test manipulation
export const mockAuthInstance = mockAuth;