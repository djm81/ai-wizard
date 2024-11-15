import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ApiOptions {
  method?: string;
  data?: any;
  headers?: Record<string, string>;
}

export const useApi = () => {
  const { getAuthToken } = useAuth();

  const apiCall = async (url: string, options: ApiOptions = {}) => {
    try {
      const token = await getAuthToken();
      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.data,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { apiCall };
};