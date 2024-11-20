import { useApi } from './hooks/useApi';
import { getEnvConfig } from 'config';
import { Project, ProjectCreate } from './types/project';
import { AIInteraction, AIInteractionCreate, aiInteractionSchema } from './types/aiInteraction';
import axios from 'axios';
import { z } from 'zod';

const { API_URL } = getEnvConfig();

// Configure axios defaults
axios.defaults.withCredentials = true; // Enable credentials for all requests

export const useProjects = () => {
  const { apiCall } = useApi();

  const getProjects = async (): Promise<Project[]> => {
    try {
      const response = await apiCall(`${API_URL}/projects/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
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
      return await apiCall(`${API_URL}/projects/${projectId}/ai-interactions/`, {
        headers: {
          'Accept': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error fetching project interactions:', error);
      throw error;
    }
  };

  const getInteraction = async (projectId: number, interactionId: number): Promise<AIInteraction> => {
    try {
      return await apiCall(`${API_URL}/projects/${projectId}/ai-interactions/${interactionId}/`);
    } catch (error) {
      console.error('Error fetching AI interaction:', error);
      throw error;
    }
  };

  const createInteraction = async (
    projectId: number,
    interaction: AIInteractionCreate
  ): Promise<AIInteraction> => {
    try {
      // Validate the interaction data before sending
      const validatedData = aiInteractionSchema.parse(interaction);
      
      return await apiCall(`${API_URL}/projects/${projectId}/ai-interactions/`, {
        method: 'POST',
        data: validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errorMessage = error.errors.map(e => e.message).join(', ');
        console.error('Validation error:', errorMessage);
        throw new Error(errorMessage);
      }
      console.error('Error creating AI interaction:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  return { getProjectInteractions, getInteraction, createInteraction };
};

export const useAI = () => {
  const { apiCall } = useApi();

  const generateCode = async (prompt: string): Promise<string> => {
    try {
      return await apiCall(`${API_URL}/ai/generate-code/`, {
        method: 'POST',
        data: { prompt },
        headers: {
          'Accept': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  };

  const refineRequirements = async (conversation: string[]): Promise<string> => {
    try {
      return await apiCall(`${API_URL}/ai/refine-requirements/`, {
        method: 'POST',
        data: conversation,
      });
    } catch (error) {
      console.error('Error refining requirements:', error);
      throw error;
    }
  };

  return { generateCode, refineRequirements };
};
