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
      const config: AxiosRequestConfig = {
        url,
        method: options.method || 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        data: options.data,
        withCredentials: true, // Enable sending cookies and auth headers
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { apiCall };
};
