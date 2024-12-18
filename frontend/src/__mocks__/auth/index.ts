import { jest } from '@jest/globals';
import type { GoogleAuthAPI, GoogleTokenClient, GoogleOAuthResponse } from '../../types/google-auth';
import type { MockFirebaseUser, MockAuthState, IdTokenResult } from '../../types/firebase-auth';
import type { User } from '../../types/auth';
import { mockApp } from '../firebase/app';

// Create the complete mock user
export const mockUser: MockFirebaseUser = {
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
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
  getIdTokenResult: jest.fn(() => Promise.resolve({
    token: 'mock-id-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'google.com',
    claims: {},
    signInSecondFactor: null
  })),
  delete: jest.fn(() => Promise.resolve()),
  reload: jest.fn(() => Promise.resolve()),
  toJSON: jest.fn(() => ({}))
};

// Export the auth state manager
export class AuthStateManager {
  private static instance: AuthStateManager;
  private currentUser: MockFirebaseUser | null = null;
  private listeners = new Set<(user: MockFirebaseUser | null) => void>();

  private constructor() {}

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  getCurrentUser(): MockFirebaseUser | null {
    return this.currentUser;
  }

  updateUser(user: MockFirebaseUser | null): void {
    this.currentUser = user;
    this.notifyListeners();
  }

  addListener(listener: (user: MockFirebaseUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  reset(): void {
    this.currentUser = null;
    this.listeners.clear();
  }
}

export const authState = AuthStateManager.getInstance();

// Export the mock auth
export const mockAuth = {
  app: mockApp,
  currentUser: authState.getCurrentUser(),
  onAuthStateChanged: authState.addListener.bind(authState),
  signOut: jest.fn(() => {
    authState.updateUser(null);
    return Promise.resolve();
  })
};

// Export the Google Provider
export const GoogleAuthProvider = {
  credential: jest.fn(() => ({
    providerId: 'google.com',
    signInMethod: 'google.com'
  }))
};

// Export converted user for auth context
export const mockAuthUser: User = {
  displayName: mockUser.displayName,
  email: mockUser.email,
  photoURL: mockUser.photoURL,
  uid: mockUser.uid
};

// Export Google mock
export const googleAuthMock: GoogleAuthAPI = {
  accounts: {
    oauth2: {
      initTokenClient: jest.fn((config) => ({
        requestAccessToken: jest.fn(() => Promise.resolve({ access_token: 'mock_token' }))
      })),
      revoke: jest.fn()
    }
  }
};

// Add mockFirebaseUser export
export { mockUser as mockFirebaseUser };
