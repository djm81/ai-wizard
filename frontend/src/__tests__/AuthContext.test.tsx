import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from '../auth/fedcmAuth';
import { mockAuthUser } from '../__mocks__/auth/fedcmAuth';
import { mockFirebaseUser, resetMockAuth } from '../__mocks__/firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

// Mock the modules
jest.mock('firebase/auth');
jest.mock('../auth/fedcmAuth');

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

    // Reset auth state before each test
    resetMockAuth(null);

    // Set up mock implementations for each test
    (initializeGoogleAuth as jest.Mock).mockResolvedValue(undefined);
    (signInWithGoogle as jest.Mock).mockResolvedValue(mockAuthUser);
    (signOut as jest.Mock).mockResolvedValue(undefined);
    (getIdToken as jest.Mock).mockResolvedValue('mock-token');
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
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(mockAuthUser);
    resetMockAuth(mockFirebaseUser);

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
      expect(authValue.user).toEqual(mockAuthUser);
    });

    expect(signInWithGoogle).toHaveBeenCalled();
  });

  test('signOut updates the user state to null', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);
    resetMockAuth(null);

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

    expect(signOut).toHaveBeenCalled();
  });

  test('getAuthToken returns the token', async () => {
    (getIdToken as jest.Mock).mockResolvedValueOnce('mock-token');
    resetMockAuth(mockFirebaseUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { authValue = auth; }} />
        </AuthProvider>
      );
    });

    const token = await authValue.getAuthToken();
    expect(token).toBe('mock-token');
    expect(getIdToken).toHaveBeenCalled();
  });
}); 