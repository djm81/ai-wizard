import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { User } from '../auth/fedcmAuth';

jest.mock('../auth/fedcmAuth', () => ({
  initializeGoogleAuth: jest.fn().mockResolvedValue(undefined),
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  getIdToken: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('AuthContext', () => {
  const TestComponent: React.FC = () => {
    const auth = useAuth();
    return <div data-testid="test-component">{JSON.stringify(auth)}</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AuthProvider provides default values', async () => {
    let rendered;
    await act(async () => {
        rendered = render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
        );
    });

    const { getByTestId } = rendered!;
    const testComponent = getByTestId('test-component');
    const authContext = JSON.parse(testComponent.textContent || '');

    expect(authContext.user).toBeNull();
    expect(authContext.loading).toBeFalsy();
    expect(typeof authContext.signIn).toBe('function');
    expect(typeof authContext.signOut).toBe('function');
    expect(typeof authContext.getAuthToken).toBe('function');
  });

  // Add more tests for signIn, signOut, and getAuthToken methods
});