// Define mocks before imports
const mockOnAuthStateChanged = jest.fn();
const mockInitializeGoogleAuth = jest.fn().mockResolvedValue(undefined);

// Setup mocks
jest.mock('../auth/fedcmAuth', () => ({
  initializeGoogleAuth: mockInitializeGoogleAuth
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: null,
    onAuthStateChanged: mockOnAuthStateChanged
  }),
  onAuthStateChanged: mockOnAuthStateChanged
}));

jest.mock('../config/firebase');

// Import dependencies after mocks
import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';

describe('AuthContext', () => {
  let authValue: AuthContextType;

  const TestComponent: React.FC = () => {
    authValue = useAuth();
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default values', async () => {
    let authCallback: ((user: any) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      return () => {};
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(mockInitializeGoogleAuth).toHaveBeenCalled();
    expect(mockOnAuthStateChanged).toHaveBeenCalled();

    await act(async () => {
      authCallback?.(null);
    });

    expect(authValue.loading).toBe(false);
    expect(authValue.user).toBeNull();
  });
});
