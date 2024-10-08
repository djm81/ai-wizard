import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIInteractions from '../pages/AIInteractions';
import { useAIInteractions } from '../api';

jest.mock('../api', () => ({
  useAIInteractions: jest.fn(),
}));

describe('AIInteractions component', () => {
  const mockInteractions = [
    { id: 1, prompt: 'Test Prompt 1', response: 'Test Response 1' },
    { id: 2, prompt: 'Test Prompt 2', response: 'Test Response 2' },
  ];

  beforeEach(() => {
    (useAIInteractions as jest.Mock).mockReturnValue({
      getAIInteractions: jest.fn().mockResolvedValue(mockInteractions),
      createAIInteraction: jest.fn().mockResolvedValue({ id: 3, prompt: 'New Prompt', response: 'New Response' }),
    });
  });

  test('renders AI Interactions list', async () => {
    render(<AIInteractions />);

    await waitFor(() => {
      expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
    });
  });

  test('creates a new AI Interaction', async () => {
    render(<AIInteractions />);

    const input = screen.getByLabelText('New Prompt');
    const button = screen.getByText('Create Interaction');

    fireEvent.change(input, { target: { value: 'New Prompt' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(useAIInteractions().createAIInteraction).toHaveBeenCalledWith({
        prompt: 'New Prompt',
        response: 'Processing...',
      });
    });
  });
});