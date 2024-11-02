import type { User as FirebaseUser, Auth, OAuthCredential, UserCredential } from 'firebase/auth';

// Define a mock user matching your User type
const mockUser: FirebaseUser = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  uid: 'test-uid',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
} as unknown as FirebaseUser;

// Mock Auth object
const mockAuth: Auth = {
  currentUser: mockUser,
  signOut: jest.fn().mockResolvedValue(undefined),
} as unknown as Auth;

// Mock onAuthStateChanged as a standalone function
export const onAuthStateChanged = jest.fn(
  (auth: Auth, callback: (user: FirebaseUser | null) => void) => {
    callback(auth.currentUser);
    return jest.fn(); // Mock unsubscribe function
  }
);

// Mock getAuth to return the mockAuth object
export const getAuth = jest.fn(() => mockAuth);

// Mock other Firebase auth functions as needed
export const signInWithCredential = jest.fn().mockResolvedValue({
  user: mockUser,
} as UserCredential);

export const getIdToken = jest.fn().mockResolvedValue('mock-id-token');

export const GoogleAuthProvider = {
  credential: jest.fn().mockReturnValue({} as OAuthCredential),
};