import { useCallback, useState } from 'react';
import axios, { AxiosRequestConfig, AxiosHeaders } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../services/logging';
import { ENV } from 'config';

// Helper function to create headers with proper type handling
const createHeaders = (headers: Record<string, string | undefined>) => {
  // Use plain object instead of Headers class for JSDOM compatibility
  const result: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });

  return result;
};

// Request ID generation with fallback
const generateRequestId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'test-' + Math.random().toString(36).substring(2, 15);
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getAuthToken } = useAuth();

  const apiCall = useCallback(async <T>(url: string, config: AxiosRequestConfig): Promise<T> => {
    const requestId = generateRequestId();
    const startTime = performance.now();
    setLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const headers = createHeaders({
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Source': 'frontend',
        ...(config.headers as Record<string, string | undefined> || {})
      });

      // Log request start
      await logger.info('API request initiated', {
        requestId,
        method: config.method || 'GET',
        url,
        environment: ENV.PUBLIC_ENVIRONMENT
      });

      const response = await axios({
        ...config,
        url,
        headers,
        withCredentials: true
      });

      const duration = performance.now() - startTime;

      // Log successful response
      await logger.info('API request completed', {
        requestId,
        method: config.method || 'GET',
        url,
        duration,
        status: response.status,
        environment: ENV.PUBLIC_ENVIRONMENT
      });

      return response.data;
    } catch (err) {
      const error = err as Error;
      const duration = performance.now() - startTime;

      // Log error with context
      await logger.error('API request failed', {
        requestId,
        method: config.method || 'GET',
        url,
        duration,
        error: error.message,
        stack: error.stack,
        environment: ENV.PUBLIC_ENVIRONMENT
      });

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  return { apiCall, loading, error };
};
