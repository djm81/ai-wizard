import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth, User } from 'auth/fedcmAuth';

// Only mock 'auth/fedcmAuth' since 'firebase/auth' is manually mocked
jest.mock('auth/fedcmAuth');

const mockUser: User = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  uid: 'test-uid'
};

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
        user: mockUser,
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

  test('AuthProvider provides user after onAuthStateChanged', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(authValue).toEqual(expect.objectContaining({
        user: {
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: null,
          uid: 'test-uid'
        },
        loading: false,
        signIn: expect.any(Function),
        signOut: expect.any(Function),
        getAuthToken: expect.any(Function)
      }));
    });
  });
  
  test('signIn updates the user state', async () => {
    const { signInWithGoogle } = require('auth/fedcmAuth');
    signInWithGoogle.mockResolvedValueOnce(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authValue.signIn();
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
    const { signOut } = require('auth/fedcmAuth');
    signOut.mockResolvedValueOnce();

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