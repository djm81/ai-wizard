import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth } from 'auth/fedcmAuth';
import type { Auth, User as FirebaseUser } from 'firebase/auth';

// Mock fedcmAuth first
jest.mock('auth/fedcmAuth', () => ({
  initializeGoogleAuth: jest.fn().mockResolvedValue(Promise.resolve()),
  signInWithGoogle: jest.fn().mockResolvedValue({
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: null,
    uid: 'test-uid'
  }),
  signOut: jest.fn().mockResolvedValue(Promise.resolve()),
  getIdToken: jest.fn().mockResolvedValue(Promise.resolve('mock-id-token'))
}));

// Create mock user
const mockUser: FirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue(Promise.resolve('mock-id-token')),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  phoneNumber: null,
  providerId: 'google.com'
};

// Mock Firebase Auth
jest.mock('firebase/auth', () => {
  const unsubscribe = jest.fn();
  return {
    getAuth: jest.fn(() => ({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockUser); // Call with mock user
        return unsubscribe;
      }),
      signOut: jest.fn().mockResolvedValue(Promise.resolve())
    })),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
    getIdToken: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: {
      credential: jest.fn()
    }
  };
});

describe('AuthContext', () => {
  let authValue: AuthContextType;

  const TestComponent: React.FC<{ setAuth: (auth: AuthContextType) => void }> = ({ setAuth }) => {
    const auth = useAuth();
    React.useEffect(() => {
      setAuth(auth);
    }, [auth, setAuth]);
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authValue = {} as AuthContextType;
  });

  test('AuthProvider provides default values', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(authValue).toEqual(expect.objectContaining({
        user: null,
        loading: false,
        signIn: expect.any(Function),
        signOut: expect.any(Function),
        getAuthToken: expect.any(Function)
      }));
    });
  });

  test('initializeGoogleAuth is called on AuthProvider mount', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(initializeGoogleAuth).toHaveBeenCalled();
    });
  });

  test('signIn updates the user state', async () => {
    const { getAuth } = require('firebase/auth');
    getAuth.mockImplementationOnce(() => ({
      currentUser: mockUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockUser);
        return jest.fn();
      }),
      signOut: jest.fn().mockResolvedValue(Promise.resolve())
    }));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(authValue.user).toEqual({
        displayName: mockUser.displayName,
        email: mockUser.email,
        photoURL: mockUser.photoURL,
        uid: mockUser.uid
      });
    });
  });

  test('signOut updates the user state to null', async () => {
    const { getAuth } = require('firebase/auth');
    const signOutSpy = jest.fn().mockResolvedValue(Promise.resolve());
    getAuth.mockImplementationOnce(() => ({
      currentUser: mockUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(null);
        return jest.fn();
      }),
      signOut: signOutSpy
    }));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authValue.signOut();
    });

    await waitFor(() => {
      expect(authValue.user).toBeNull();
    });
  });

  test('getAuthToken returns the token', async () => {
    const { getIdToken } = require('auth/fedcmAuth');
    const mockToken = 'mock-id-token';
    getIdToken.mockResolvedValueOnce(mockToken);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    const token = await authValue.getAuthToken();
    expect(token).toBe(mockToken);
  });
}); 