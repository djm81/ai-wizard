import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Header component', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      getAuthToken: jest.fn()
    });

    render(
      <Router>
        <Header />
      </Router>
    );

    expect(screen.getByText('AI Wizard')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Interactions')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  test('renders correctly when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: null,
        uid: 'test-uid'
      },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      getAuthToken: jest.fn()
    });

    render(
      <Router>
        <Header />
      </Router>
    );

    expect(screen.getByText('AI Wizard')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});