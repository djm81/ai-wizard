import { useProjects, useAIInteractions } from '../api';
import type { Project } from '../types/project';
import type { AIInteraction } from '../types/aiInteraction';

// Create a mock function that we can track
const mockApiCall = jest.fn();

// Mock the useApi hook
jest.mock('../hooks/useApi', () => ({
  useApi: () => ({
    apiCall: mockApiCall
  })
}));

interface ApiOptions<T> {
  method?: string;
  data?: T;
}

describe('API hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    mockApiCall.mockImplementation((url: string, options?: ApiOptions<Project | AIInteraction>) => {
      if (url.includes('projects')) {
        return Promise.resolve(options?.method === 'POST' 
          ? { ...(options.data as Project), id: 1 } 
          : []
        );
      }
      if (url.includes('ai-interactions')) {
        return Promise.resolve(options?.method === 'POST' 
          ? { ...(options.data as AIInteraction), id: 1 } 
          : []
        );
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('useProjects', () => {
    test('getProjects calls apiCall with correct URL', async () => {
      const { getProjects } = useProjects();
      const result = await getProjects();
      
      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/projects');
      expect(result).toEqual([]);
    });

    test('createProject calls apiCall with correct URL and data', async () => {
      const { createProject } = useProjects();
      const projectData: Omit<Project, 'id'> = { 
        name: 'Test Project', 
        description: 'Test Description' 
      };
      const result = await createProject(projectData);
      
      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/projects', {
        method: 'POST',
        data: projectData,
      });
      expect(result).toEqual({ ...projectData, id: 1 });
    });
  });

  describe('useAIInteractions', () => {
    test('getAIInteractions calls apiCall with correct URL', async () => {
      const { getAIInteractions } = useAIInteractions();
      const result = await getAIInteractions();
      
      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/ai-interactions');
      expect(result).toEqual([]);
    });

    test('createAIInteraction calls apiCall with correct URL and data', async () => {
      const { createAIInteraction } = useAIInteractions();
      const interactionData: Omit<AIInteraction, 'id'> = { 
        prompt: 'Test Prompt', 
        response: 'Test Response' 
      };
      const result = await createAIInteraction(interactionData);
      
      expect(mockApiCall).toHaveBeenCalledWith('http://localhost:8000/api/ai-interactions', {
        method: 'POST',
        data: interactionData,
      });
      expect(result).toEqual({ ...interactionData, id: 1 });
    });
  });
});