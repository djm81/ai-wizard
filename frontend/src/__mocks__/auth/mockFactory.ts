import { jest } from '@jest/globals';
import { mockApp } from '../firebase/app';
import type { User, UserCredential } from 'firebase/auth';
import type { GoogleOAuthResponse, TokenClientConfig } from '../../types/google-auth';
import type { MockFirebaseUser, IdTokenResult } from '../../types/firebase-auth';

// Create mock user
const mockUser: MockFirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2024-01-01T00:00:00Z',
    lastSignInTime: '2024-01-01T00:00:00Z'
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  phoneNumber: null,
  providerId: 'google.com',
  getIdToken: jest.fn<() => Promise<string>>().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn<() => Promise<IdTokenResult>>().mockResolvedValue({
    token: 'mock-id-token',
    claims: {},
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'google.com',
    signInSecondFactor: null
  }),
  delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  reload: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  toJSON: jest.fn<() => object>().mockReturnValue({})
};

// Define types for our mocks
type AuthStateCallback = (user: User | null) => void;
type AuthStateUnsubscribe = () => void;

export const createAuthMocks = () => {
  const mockOnAuthStateChanged = jest.fn((callback: AuthStateCallback): AuthStateUnsubscribe => {
    callback(null);
    return () => {};
  });

  const mockSignInWithCredential = jest.fn<() => Promise<UserCredential>>().mockResolvedValue({
    user: mockUser as unknown as User,
    providerId: 'google.com',
    operationType: 'signIn'
  } as UserCredential);

  const mockRequestAccessToken = jest.fn((config: Partial<TokenClientConfig>) => {
    if (config?.callback) {
      config.callback({ access_token: 'test-token' });
    }
  });

  // Create mockAuth object
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: mockOnAuthStateChanged,
    signInWithCredential: mockSignInWithCredential
  };

  const mockAnalytics = {
    app: mockApp,
    name: '[DEFAULT]'
  };

  return {
    mockOnAuthStateChanged,
    mockSignInWithCredential,
    mockRequestAccessToken,
    mockAnalytics,
    mockAuth
  };
};
