import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from '../auth/fedcmAuth';
import { mockAuthUser } from '../__mocks__/auth/fedcmAuth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

// Mock the modules
jest.mock('../auth/fedcmAuth');
jest.mock('firebase/auth');

describe('AuthContext', () => {
  let authValue: AuthContextType;
  const mockFirebaseUser = (global as any).mockFirebaseUser;

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

    // Mock the auth state change handler to call the callback immediately
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        // Call the callback immediately with null user
        setTimeout(() => {
          callback(null);
        }, 0);
        return () => {}; // Return a valid unsubscribe function
      })
    });

    // Set up mock implementations
    (initializeGoogleAuth as jest.Mock).mockResolvedValue(undefined);
    (signInWithGoogle as jest.Mock).mockResolvedValue(mockAuthUser);
    (signOut as jest.Mock).mockResolvedValue(undefined);
    (getIdToken as jest.Mock).mockResolvedValue('mock-token');
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

    // Wait for initial render and loading to complete
    await waitFor(() => {
      expect(rendered).toBe(true);
      expect(authValue.loading).toBe(false);
    }, { timeout: 3000 });

    expect(authValue).toEqual({
      user: null,
      loading: false,
      signIn: expect.any(Function),
      signOut: expect.any(Function),
      getAuthToken: expect.any(Function)
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
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: mockFirebaseUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockFirebaseUser);
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
      currentUser: mockFirebaseUser,
      onAuthStateChanged: jest.fn((callback) => {
        callback(mockFirebaseUser);
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