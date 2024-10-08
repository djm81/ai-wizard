import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Header component', () => {
  test('renders correctly when user is not logged in', () => {
    render(
      <Router>
        <AuthProvider>
          <Header />
        </AuthProvider>
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
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: { displayName: 'Test User', email: 'test@example.com' },
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    }));

    render(
      <Router>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </Router>
    );

    expect(screen.getByText('AI Wizard')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('AI Interactions')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});