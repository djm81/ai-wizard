import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { User } from '../types/auth';

// Define mockUser before using it in the mock
const mockUser: User = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
  uid: 'test-uid'
};

// Mock the auth functions
jest.mock('../auth/fedcmAuth', () => ({
  initializeGoogleAuth: jest.fn().mockResolvedValue(undefined),
  signInWithGoogle: jest.fn().mockResolvedValue(mockUser),
  signOut: jest.fn().mockResolvedValue(undefined),
  getIdToken: jest.fn().mockResolvedValue('test-token'),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => {
  const mockUnsubscribe = jest.fn();
  return {
    getAuth: jest.fn(() => ({
      currentUser: null,
      signOut: jest.fn().mockResolvedValue(undefined),
    })),
    onAuthStateChanged: jest.fn((_auth, callback) => {
      // Immediately call with null to simulate initial state
      callback(null);
      return mockUnsubscribe;
    }),
    GoogleAuthProvider: {
      credential: jest.fn(),
    },
    signInWithCredential: jest.fn(),
  };
});

describe('AuthContext', () => {
  const TestComponent: React.FC = () => {
    const auth = useAuth();
    return <div data-testid="test-component">{JSON.stringify(auth)}</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AuthProvider provides default values', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const testComponent = getByTestId('test-component');
      const authContext = JSON.parse(testComponent.textContent || '{}');
      expect(authContext).toEqual(expect.objectContaining({
        user: null,
        loading: false,
        signIn: expect.any(Function),
        signOut: expect.any(Function),
        getAuthToken: expect.any(Function)
      }));
    });
  });

  test('signIn function works correctly', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const testComponent = getByTestId('test-component');
      const authContext = JSON.parse(testComponent.textContent || '{}');
      expect(authContext.signIn).toBeDefined();
    });

    const testComponent = getByTestId('test-component');
    const authContext = JSON.parse(testComponent.textContent || '{}');

    await act(async () => {
      await authContext.signIn();
    });

    await waitFor(() => {
      const updatedContext = JSON.parse(getByTestId('test-component').textContent || '{}');
      expect(updatedContext.user).toEqual(mockUser);
    });
  });
});