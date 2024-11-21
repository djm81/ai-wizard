import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AIInteractions from '../pages/AIInteractions';
import { useAIInteractions } from '../api';

jest.mock('../api', () => ({
  useAIInteractions: jest.fn(),
}));

describe('AIInteractions component', () => {
  const projectId = '1';
  const mockInteractions = [
    { id: 1, prompt: 'Test Prompt 1', response: 'Test Response 1', created_at: new Date().toISOString() },
    { id: 2, prompt: 'Test Prompt 2', response: 'Test Response 2', created_at: new Date().toISOString() }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = async () => {
    (useAIInteractions as jest.Mock).mockReturnValue({
      getProjectInteractions: jest.fn().mockResolvedValue(mockInteractions),
      createInteraction: jest.fn().mockResolvedValue({
        id: 3,
        prompt: 'New Prompt',
        response: 'Processing...',
        created_at: new Date().toISOString()
      }),
    });

    let result;
    await act(async () => {
      result = render(
        <MemoryRouter initialEntries={[`/projects/${projectId}/ai-interactions`]}>
          <Routes>
            <Route path="/projects/:projectId/ai-interactions" element={<AIInteractions />} />
          </Routes>
        </MemoryRouter>
      );
    });
    return result;
  };

  test('renders AI Interactions list', async () => {
    await renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Test Prompt 1', { selector: 'h6' })).toBeInTheDocument();
      expect(screen.getByText('Test Response 1')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt 2', { selector: 'h6' })).toBeInTheDocument();
      expect(screen.getByText('Test Response 2')).toBeInTheDocument();
    });
  });

  test('creates a new AI Interaction', async () => {
    await renderWithRouter();

    await waitFor(() => {
      const input = screen.getByLabelText('Enter your prompt *');
      const button = screen.getByText('Create Interaction');

      fireEvent.change(input, { target: { value: 'New Prompt' } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(useAIInteractions().createInteraction).toHaveBeenCalledWith(
        parseInt(projectId),
        {
          prompt: 'New Prompt'
        }
      );
    });
  });

  test('handles API errors gracefully', async () => {
    (useAIInteractions as jest.Mock).mockReturnValue({
      getProjectInteractions: jest.fn().mockRejectedValue(new Error('API Error')),
      createInteraction: jest.fn().mockRejectedValue(new Error('API Error')),
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

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch interactions')).toBeInTheDocument();
    });
  });
});
