import type { User, Auth, AuthCredential } from 'firebase/auth';

// Use the global mock Firebase user
export const mockFirebaseUser = (global as any).mockFirebaseUser;

// Create a mutable auth state
let currentUser: User | null = mockFirebaseUser;

// Export functions that return consistent values
export const getAuth = jest.fn().mockReturnValue({
  currentUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(currentUser);
    return jest.fn();
  })
} as unknown as Auth);

export const signInWithCredential = jest.fn().mockResolvedValue({ user: mockFirebaseUser });
export const signOut = jest.fn().mockResolvedValue(undefined);
export const getIdToken = jest.fn().mockResolvedValue('mock-token');

export const GoogleAuthProvider = {
  credential: jest.fn().mockReturnValue({
    providerId: 'google.com',
    signInMethod: 'google.com',
    toJSON: () => ({
      providerId: 'google.com',
      signInMethod: 'google.com',
      accessToken: 'mock_token'
    })
  } satisfies AuthCredential)
};

// Reset function for tests
export const resetMockAuth = (user: User | null = mockFirebaseUser) => {
  currentUser = user;
  getAuth.mockReturnValue({
    currentUser: user,
    onAuthStateChanged: jest.fn((callback) => {
      callback(user);
      return jest.fn();
    })
  } as unknown as Auth);
};