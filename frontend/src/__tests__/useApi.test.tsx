import { renderHook } from '@testing-library/react';
import { useApi } from '../hooks/useApi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Mock axios and auth
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
    // Suppress console.error for tests
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;
  });

  test('apiCall sends request with authorization header', async () => {
    const { result } = renderHook(() => useApi());
    const response = await result.current.apiCall('http://example.com/api');

    expect(axios).toHaveBeenCalledWith({
      url: 'http://example.com/api',
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    expect(response).toBe('mock-response');
  });

  test('apiCall handles errors', async () => {
    const mockError = new Error('API Error');
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useApi());
    await expect(result.current.apiCall('http://example.com/api')).rejects.toThrow('API Error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('API call error:', mockError);
  });
});