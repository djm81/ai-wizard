import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from 'auth/fedcmAuth';
import { mockAuthUser } from '../__mocks__/auth';
import { getAuth } from 'firebase/auth';

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
    let rendered = false;

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent setAuth={(auth) => { 
            authValue = auth;
            rendered = true;
          }} />
        </AuthProvider>
      );
    });

    // Loading should be false after initialization
    // expect(authValue.loading).toBe(false);

    // Wait for auth initialization and loading state update
    await waitFor(() => {
      expect(rendered).toBe(true);
      expect(initializeGoogleAuth).toHaveBeenCalled();
    });

    // Wait specifically for loading to become false
    await waitFor(() => {
      expect(authValue.loading).toBe(false);
    });

    // Then check user state
    expect(authValue.user).toBeNull();
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
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: mockAuthUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockAuthUser);
        return jest.fn();
      })
    });

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
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        callback(null);
        return jest.fn();
      })
    });

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
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: mockAuthUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockAuthUser);
        return jest.fn();
      })
    });

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