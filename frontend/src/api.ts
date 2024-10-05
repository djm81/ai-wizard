import axios from 'axios';
import { Project } from './types/project';
import { AIInteraction } from './types/aiInteraction';

const API_URL = 'http://localhost:8000/api'; // Update this with your backend URL

export const getProjects = async (): Promise<Project[]> => {
  const response = await axios.get(`${API_URL}/projects`);
  return response.data;
};

export const getAIInteractions = async (): Promise<AIInteraction[]> => {
  const response = await axios.get(`${API_URL}/ai-interactions`);
  return response.data;
};

// Add more API functions as needed