// import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

describe('Home component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to AI Wizard')).toBeInTheDocument();
  });

  test('renders description', () => {
    render(<Home />);
    expect(screen.getByText(/AI Wizard is a rapid application assistant/)).toBeInTheDocument();
  });
});
