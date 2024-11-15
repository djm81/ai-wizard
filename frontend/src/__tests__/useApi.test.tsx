import { renderHook } from '@testing-library/react';
import { useApi } from '../hooks/useApi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

jest.mock('axios');
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('useApi hook', () => {
  const mockGetAuthToken = jest.fn().mockResolvedValue('mock-token');
  const originalError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      getAuthToken: mockGetAuthToken
    });
    (axios as unknown as jest.Mock).mockResolvedValue({ data: 'mock-response' });
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  test('apiCall sends request with authorization header', async () => {
    const { result } = renderHook(() => useApi());
    
    mockGetAuthToken.mockResolvedValueOnce('mock-token');
    
    const response = await result.current.apiCall('http://example.com/api');

    expect(axios).toHaveBeenCalledWith({
      url: 'http://example.com/api',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      },
      data: undefined
    });
    expect(response).toBe('mock-response');
  });

  test('apiCall handles errors', async () => {
    const mockError = new Error('API Error');
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useApi());
    await expect(result.current.apiCall('http://example.com/api')).rejects.toThrow('API Error');
    
    expect(console.error).toHaveBeenCalledWith('API call error:', mockError);
  });
});