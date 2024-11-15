import { useApi } from './hooks/useApi';
import { getEnvConfig } from 'config';
import { Project, ProjectCreate } from './types/project';
import { AIInteraction, AIInteractionCreate } from './types/aiInteraction';
import axios from 'axios';

const { API_URL } = getEnvConfig();

export const useProjects = () => {
  const { apiCall } = useApi();

  const getProjects = async (): Promise<Project[]> => {
    try {
      const response = await apiCall(`${API_URL}/projects/`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  const createProject = async (project: ProjectCreate): Promise<Project> => {
    try {
      return await apiCall(`${API_URL}/projects/`, {
        method: 'POST',
        data: project,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: number): Promise<void> => {
    try {
      await apiCall(`${API_URL}/projects/${projectId}/`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return { getProjects, createProject, deleteProject };
};

export const useAIInteractions = () => {
  const { apiCall } = useApi();

  const getProjectInteractions = async (projectId: number): Promise<AIInteraction[]> => {
    try {
      return await apiCall(`${API_URL}/projects/${projectId}/ai-interactions/`);
    } catch (error) {
      console.error('Error fetching project interactions:', error);
      throw error;
    }
  };

  const createInteraction = async (
    projectId: number, 
    interaction: AIInteractionCreate
  ): Promise<AIInteraction> => {
    try {
      return await apiCall(`${API_URL}/projects/${projectId}/ai-interactions/`, {
        method: 'POST',
        data: interaction,
      });
    } catch (error) {
      console.error('Error creating AI interaction:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  return { getProjectInteractions, createInteraction };
};
