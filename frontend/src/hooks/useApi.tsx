import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export const useApi = () => {
  const { getAuthToken } = useAuth();

  const apiCall = async (url: string, options: any = {}) => {
    const token = await getAuthToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    try {
      console.log('API call to:', url);
      console.log('Headers:', headers);
      const response = await axios({
        ...options,
        url,
        headers
      });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      throw error;
    }
  };

  return { apiCall };
};