import { renderHook } from '@testing-library/react';
import { useApi } from '../hooks/useApi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

jest.mock('axios');
jest.mock('../contexts/AuthContext');

describe('useApi hook', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      getAuthToken: jest.fn().mockResolvedValue('mock-token'),
    });
  });

  test('apiCall sends request with authorization header', async () => {
    (axios as unknown as jest.Mock).mockResolvedValue({ data: 'mock-response' });

    const { result } = renderHook(() => useApi());
    const response = await result.current.apiCall('http://example.com/api');

    expect(axios).toHaveBeenCalledWith({
      url: 'http://example.com/api',
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
    expect(response).toBe('mock-response');
  });

  test('apiCall handles errors', async () => {
    const mockError = new Error('API Error');
    (axios as unknown as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi());
    await expect(result.current.apiCall('http://example.com/api')).rejects.toThrow('API Error');
  });
});