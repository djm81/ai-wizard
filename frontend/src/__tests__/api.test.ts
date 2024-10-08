import { useProjects, useAIInteractions } from '../api';
import { useApi } from '../hooks/useApi';

jest.mock('../hooks/useApi');

describe('API hooks', () => {
  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      apiCall: jest.fn(),
    });
  });

  describe('useProjects', () => {
    test('getProjects calls apiCall with correct URL', async () => {
      const mockApiCall = jest.fn().mockResolvedValue([]);
      (useApi as jest.Mock).mockReturnValue({ apiCall: mockApiCall });

      const { getProjects } = useProjects();
      await getProjects();

      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/projects');
    });

    test('createProject calls apiCall with correct URL and data', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({});
      (useApi as jest.Mock).mockReturnValue({ apiCall: mockApiCall });

      const { createProject } = useProjects();
      const projectData = { name: 'Test Project', description: 'Test Description' };
      await createProject(projectData);

      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/projects', {
        method: 'POST',
        data: projectData,
      });
    });
  });

  describe('useAIInteractions', () => {
    test('getAIInteractions calls apiCall with correct URL', async () => {
      const mockApiCall = jest.fn().mockResolvedValue([]);
      (useApi as jest.Mock).mockReturnValue({ apiCall: mockApiCall });

      const { getAIInteractions } = useAIInteractions();
      await getAIInteractions();

      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/ai-interactions');
    });

    test('createAIInteraction calls apiCall with correct URL and data', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({});
      (useApi as jest.Mock).mockReturnValue({ apiCall: mockApiCall });

      const { createAIInteraction } = useAIInteractions();
      const interactionData = { prompt: 'Test Prompt', response: 'Test Response' };
      await createAIInteraction(interactionData);

      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/ai-interactions', {
        method: 'POST',
        data: interactionData,
      });
    });
  });
});