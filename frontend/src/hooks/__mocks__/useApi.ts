import { v4 as uuidv4 } from 'uuid';
import type { AxiosRequestConfig } from 'axios';
import { TestEnvironment } from '../../jest.setup';
import { logger } from '../../services/logging';

console.log('Loading useApi mock');

interface Headers {
  [key: string]: string;
}

interface ApiConfig extends Omit<AxiosRequestConfig, 'headers'> {
  headers?: Headers;
}

export const mockApiCall = jest.fn();

// Test environment flag
const isTestEnvironment = process.env.NODE_ENV === 'test';

export const useApi = () => {
  const apiCall = async (url: string, config: ApiConfig = {}) => {
    const requestId = TestEnvironment.mockUUID;
    const startTime = performance.now();

    try {
      const callConfig = {
        ...config,
        headers: {
          ...config.headers,
          'X-Request-ID': requestId,
        } as Headers,
      };

      // Log request start
      await logger.info('API request initiated', {
        requestId,
        method: config.method || 'GET',
        url,
        environment: 'test'
      });

      const response = await mockApiCall(url, callConfig);

      // Log success
      await logger.info('API request completed', {
        requestId,
        method: config.method || 'GET',
        url,
        duration: performance.now() - startTime,
        environment: 'test'
      });

      return response;
    } catch (error) {
      // Log error
      await logger.error('API request failed', {
        requestId,
        method: config.method || 'GET',
        url,
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: 'test'
      });
      throw error;
    }
  };

  return { apiCall, loading: false, error: null };
};

// Reset helper with proper typing
export const resetApiMock = () => {
  console.log('Resetting API mock');
  mockApiCall.mockReset();
  mockApiCall.mockImplementation((url: string, config?: ApiConfig) => {
    console.log('Reset mockApiCall called with:', { url, config });
    return Promise.resolve({ success: true });
  });
};
