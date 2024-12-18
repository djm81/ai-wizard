import { renderHook, act } from '@testing-library/react';
import { useApi } from '../hooks/useApi';
import { logger } from '../services/logging';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Mock logger
jest.mock('../services/logging');

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs API calls with Firebase logger', async () => {
    // Setup success response
    mockedAxios.mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.apiCall('http://example.com/api', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    expect(logger.info).toHaveBeenCalledWith(
      'API request initiated',
      expect.objectContaining({
        method: 'GET',
        url: 'http://example.com/api',
        environment: expect.any(String)
      })
    );
  });
});
