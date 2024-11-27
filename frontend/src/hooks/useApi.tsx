import { useAuth } from '../contexts/AuthContext';
import axios, { AxiosRequestConfig } from 'axios';

interface ApiCallOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export const useApi = () => {
  const { getAuthToken } = useAuth();

  const apiCall = async (url: string, options: ApiCallOptions = {}) => {
    try {
      const token = await getAuthToken();
      console.log('Making API call to:', url, 'with method:', options.method || 'GET');

      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        data: options.data,
        withCredentials: true
      });

      console.log('API response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { apiCall };
};
