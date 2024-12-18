import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AIInteractions from '../pages/AIInteractions';
import { useAIInteractions } from '../api';
import type { AIInteraction } from '../types/aiInteraction';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock the useAIInteractions hook
jest.mock('../api', () => ({
  useAIInteractions: jest.fn(),
}));

describe('AIInteractions component', () => {
  const projectId = '1';
  const mockInteractions = [
    { id: 1, prompt: 'Test Prompt 1', response: 'Test Response 1', created_at: new Date().toISOString() },
    { id: 2, prompt: 'Test Prompt 2', response: 'Test Response 2', created_at: new Date().toISOString() }
  ];

  // Mock AbortController
  const mockAbortController = {
    signal: { aborted: false },
    abort: jest.fn()
  };

  // Store original AbortController
  const originalAbortController = global.AbortController;

  beforeAll(() => {
    // Mock AbortController globally
    global.AbortController = jest.fn(() => mockAbortController) as unknown as typeof AbortController;
  });

  afterAll(() => {
    // Restore original AbortController
    global.AbortController = originalAbortController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockClear();
    // Reset mock implementations
    (useAIInteractions as jest.Mock).mockReturnValue({
      getProjectInteractions: jest.fn().mockResolvedValue(mockInteractions),
      createInteraction: jest.fn().mockResolvedValue({
        id: 3,
        prompt: 'New Prompt',
        response: 'Processing...',
        created_at: new Date().toISOString()
      }),
    });
  });

  test('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    (useAIInteractions as jest.Mock).mockReturnValue({
      getProjectInteractions: jest.fn().mockRejectedValue(mockError),
      createInteraction: jest.fn().mockRejectedValue(mockError),
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/projects/${projectId}/ai-interactions`]}>
          <Routes>
            <Route path="/projects/:projectId/ai-interactions" element={<AIInteractions />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch interactions')).toBeInTheDocument();
    });

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error:', 'API Error');
  });

  test('creates a new interaction', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/projects/${projectId}/ai-interactions`]}>
          <Routes>
            <Route path="/projects/:projectId/ai-interactions" element={<AIInteractions />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // Wait for the component to load
    await waitFor(() => {
      const textbox = screen.getByRole('textbox', { name: /enter your prompt/i });
      expect(textbox).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /enter your prompt/i });
    const button = screen.getByText('Create Interaction');

    // Type a valid prompt
    await act(async () => {
      fireEvent.change(input, { target: { value: 'This is a test prompt that is long enough' } });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify the interaction was created
    expect(useAIInteractions().createInteraction).toHaveBeenCalledWith(
      parseInt(projectId),
      { prompt: 'This is a test prompt that is long enough' }
    );
  });
});
