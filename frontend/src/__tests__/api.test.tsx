import { useProjects, useAIInteractions } from '../api';
import type { Project, ProjectCreate } from '../types/project';
import type { AIInteraction, AIInteractionCreate } from '../types/aiInteraction';
import { ENV } from '../__mocks__/env';

// Create a mock function that we can track
const mockApiCall = jest.fn();

// Mock the useApi hook
jest.mock('../hooks/useApi', () => ({
  useApi: () => ({
    apiCall: mockApiCall
  })
}));

describe('API hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    mockApiCall.mockImplementation((url: string, options?: { method?: string; data?: any }) => {
      if (url.includes('projects')) {
        if (url.includes('ai-interactions')) {
          return Promise.resolve(options?.method === 'POST'
            ? { ...(options.data as AIInteraction), id: 1 }
            : []
          );
        }
        return Promise.resolve(options?.method === 'POST'
          ? { ...(options.data as Project), id: 1 }
          : options?.method === 'DELETE'
          ? undefined
          : []
        );
      }
      return Promise.resolve(null);
    });
  });

  describe('useProjects', () => {
    test('getProjects calls apiCall with correct URL and method', async () => {
      const { getProjects } = useProjects();
      await getProjects();

      expect(mockApiCall).toHaveBeenCalledWith(`${ENV.PUBLIC_API_URL}/projects/`, {
        method: 'GET'
      });
    });

    test('createProject calls apiCall with correct URL and data', async () => {
      const { createProject } = useProjects();
      const projectData: ProjectCreate = {
        name: 'Test Project',
        description: 'Test Description'
      };
      await createProject(projectData);

      expect(mockApiCall).toHaveBeenCalledWith(`${ENV.PUBLIC_API_URL}/projects/`, {
        method: 'POST',
        data: projectData,
      });
    });

    test('deleteProject calls apiCall with correct URL and method', async () => {
      const { deleteProject } = useProjects();
      const projectId = 1;
      await deleteProject(projectId);

      expect(mockApiCall).toHaveBeenCalledWith(`${ENV.PUBLIC_API_URL}/projects/${projectId}/`, {
        method: 'DELETE'
      });
    });
  });

  describe('useAIInteractions', () => {
    const projectId = 1;

    test('getProjectInteractions calls apiCall with correct URL', async () => {
      const { getProjectInteractions } = useAIInteractions();
      await getProjectInteractions(projectId);

      expect(mockApiCall).toHaveBeenCalledWith(
        `${ENV.PUBLIC_API_URL}/projects/${projectId}/ai-interactions/`
      );
    });

    test('createInteraction calls apiCall with correct URL and data', async () => {
      const { createInteraction } = useAIInteractions();
      const interactionData: AIInteractionCreate = {
        prompt: 'Test Prompt'
      };
      await createInteraction(projectId, interactionData);

      expect(mockApiCall).toHaveBeenCalledWith(
        `${ENV.PUBLIC_API_URL}/projects/${projectId}/ai-interactions/`,
        {
          method: 'POST',
          data: interactionData,
        }
      );
    });
  });
});
