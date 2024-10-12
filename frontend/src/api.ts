import { useApi } from './hooks/useApi';
import { Project } from './types/project';
import { AIInteraction } from './types/aiInteraction';
import axios from 'axios';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

export const useProjects = () => {
  const { apiCall } = useApi();

  const getProjects = async (): Promise<Project[]> => {
    try {
      const response = await apiCall(`${API_URL}/projects`);
      console.log('Projects response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      return await apiCall(`${API_URL}/projects`, {
        method: 'POST',
        data: project,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  return { getProjects, createProject };
};

export const useAIInteractions = () => {
  const { apiCall } = useApi();

  const getAIInteractions = async (): Promise<AIInteraction[]> => {
    try {
      return await apiCall(`${API_URL}/ai-interactions`);
    } catch (error) {
      console.error('Error fetching AI interactions:', error);
      throw error;
    }
  };

  const createAIInteraction = async (interaction: Omit<AIInteraction, 'id'>): Promise<AIInteraction> => {
    try {
      return await apiCall(`${API_URL}/ai-interactions`, {
        method: 'POST',
        data: interaction,
      });
    } catch (error) {
      console.error('Error creating AI interaction:', error);
      throw error;
    }
  };

  return { getAIInteractions, createAIInteraction };
};
