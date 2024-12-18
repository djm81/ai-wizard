import { useApi } from './hooks/useApi';
import { getEnvConfig } from 'config';
import type { Project, ProjectCreate } from './types/project';
import type { AIInteraction, AIInteractionCreate } from './types/aiInteraction';
import type { ApiError, ApiResponse } from './types/api';
import { logger } from './services/logging';

const { API_URL } = getEnvConfig();

export const useProjects = () => {
  const { apiCall } = useApi();

  const getProjects = async (): Promise<Project[]> => {
    try {
      const response = await apiCall<ApiResponse<Project[]>>(`${API_URL}/projects/`, {
        method: 'GET'
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch projects', { error });
      throw error;
    }
  };

  const createProject = async (project: ProjectCreate): Promise<Project> => {
    try {
      const response = await apiCall<ApiResponse<Project>>(`${API_URL}/projects/`, {
        method: 'POST',
        data: project
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to create project', { error });
      throw error;
    }
  };

  const deleteProject = async (projectId: number): Promise<void> => {
    try {
      await apiCall<ApiResponse<void>>(`${API_URL}/projects/${projectId}/`, {
        method: 'DELETE'
      });
    } catch (error) {
      logger.error('Failed to delete project', { error });
      throw error;
    }
  };

  return { getProjects, createProject, deleteProject };
};

export const useAIInteractions = () => {
  const { apiCall } = useApi();

  const getProjectInteractions = async (projectId: number): Promise<AIInteraction[]> => {
    try {
      const response = await apiCall<ApiResponse<AIInteraction[]>>(
        `${API_URL}/projects/${projectId}/ai-interactions/`,
        { method: 'GET' }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch AI interactions', { error, projectId });
      throw error;
    }
  };

  const createInteraction = async (projectId: number, data: AIInteractionCreate): Promise<AIInteraction> => {
    try {
      const response = await apiCall<ApiResponse<AIInteraction>>(
        `${API_URL}/projects/${projectId}/ai-interactions/`,
        {
          method: 'POST',
          data
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to create AI interaction', { error, projectId });
      throw error;
    }
  };

  return { getProjectInteractions, createInteraction };
};
