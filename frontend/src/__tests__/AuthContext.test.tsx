import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import { initializeGoogleAuth, signInWithGoogle, signOut, getIdToken } from '../auth/fedcmAuth';
import { mockAuthUser, mockFirebaseUser } from '../__mocks__/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

// Mock the modules
jest.mock('../auth/fedcmAuth');
jest.mock('firebase/auth');

// Define TestComponent type
interface TestComponentProps {
  setAuth: (auth: AuthContextType) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ setAuth }) => {
  const auth = useAuth();
  React.useEffect(() => {
    setAuth(auth);
  }, [auth, setAuth]);
  return null;
};

describe('AuthContext', () => {
  let authValue: AuthContextType;

  beforeEach(() => {
    jest.clearAllMocks();
    authValue = {} as AuthContextType;

    // Start with no user
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        setTimeout(() => callback(null), 0);
        return () => {};
      })
    });

    // Mock initializeGoogleAuth to resolve immediately
    (initializeGoogleAuth as jest.Mock).mockResolvedValue(undefined);
  });

  test('AuthProvider provides default values', async () => {
    let rendered = false;
    
    // Mock initializeGoogleAuth to resolve immediately
    (initializeGoogleAuth as jest.Mock).mockResolvedValue(undefined);
    
    // Mock auth state change to happen after a delay
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        setTimeout(() => {
          callback(null);
        }, 100); // Small delay to simulate async behavior
        return () => {};
      })
    });

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

    // First, verify that loading is true initially
    expect(authValue.loading).toBe(true);

    // Then wait for auth initialization to complete
    await waitFor(() => {
      expect(rendered).toBe(true);
      expect(authValue.loading).toBe(false);
    }, { timeout: 3000 });

    // Finally verify the complete state
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