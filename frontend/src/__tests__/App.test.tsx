import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
// import { AuthProvider } from '../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    loading: false,
    user: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the components
jest.mock('../components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../pages/Home', () => () => <div data-testid="mock-home">Home</div>);
jest.mock('../pages/Projects', () => () => <div data-testid="mock-projects">Projects</div>);
jest.mock('../pages/AIInteractions', () => () => <div data-testid="mock-ai-interactions">AI Interactions</div>);

describe('App component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    render(<App />);
    expect(screen.getByTestId('mock-home')).toBeInTheDocument();
  });

  test('does not render private routes when user is not authenticated', () => {
    render(<App />);
    expect(screen.queryByTestId('mock-projects')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-ai-interactions')).not.toBeInTheDocument();
  });
});
