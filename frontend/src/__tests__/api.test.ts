import { renderHook, act } from '@testing-library/react';
import { useApi } from '../hooks/useApi';
import { logger } from '../services/logging';
import axios from 'axios';

// Mock modules
jest.mock('axios');
jest.mock('../services/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

const mockedAxios = jest.mocked(axios);
const mockedLogger = jest.mocked(logger);

describe('API hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useApi', () => {
    it('logs API calls correctly', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { success: true }, status: 200 });

      const { result } = renderHook(() => useApi());

      await act(async () => {
        await result.current.apiCall('http://example.com/api', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
      });

      expect(mockedLogger.info).toHaveBeenCalledWith(
        'API request initiated',
        expect.objectContaining({
          method: 'GET',
          url: 'http://example.com/api'
        })
      );
    });

    it('logs errors correctly', async () => {
      const testError = new Error('Test error');
      mockedAxios.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useApi());

      await act(async () => {
        try {
          await result.current.apiCall('http://example.com/api', { method: 'GET' });
        } catch (error) {
          expect(mockedLogger.error).toHaveBeenCalledWith(
            'API request failed',
            expect.objectContaining({
              method: 'GET',
              url: 'http://example.com/api',
              error: 'Test error'
            })
          );
        }
      });
    });
  });
});
