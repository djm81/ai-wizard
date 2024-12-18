// Setup mocks before any imports
jest.mock('firebase/auth');
jest.mock('../config/firebase');

// Import dependencies after mocks
import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';
import type { User } from 'firebase/auth';
import { createAuthMocks } from '../__mocks__/auth/mockFactory';

const { mockOnAuthStateChanged } = createAuthMocks();

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: null,
    onAuthStateChanged: mockOnAuthStateChanged
  })
}));

describe('AuthContext', () => {
  let authValue: AuthContextType;

  const TestComponent: React.FC = () => {
    authValue = useAuth();
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(authValue.loading).toBe(true);
    expect(mockOnAuthStateChanged).toHaveBeenCalled();

    act(() => {
      const [callback] = mockOnAuthStateChanged.mock.calls[0] as [(user: User | null) => void];
      callback(null);
    });

    expect(authValue.loading).toBe(false);
    expect(authValue.user).toBeNull();
  });
});
