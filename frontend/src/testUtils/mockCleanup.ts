import { mockApiCall } from '../hooks/__mocks__/useApi';
import { mockAuthContext } from '../__mocks__/auth';

export const resetAllMocks = () => {
  console.log('Resetting all mocks...');

  // Reset API mocks
  mockApiCall.mockReset();
  mockApiCall.mockImplementation((url: string, config?: any) => {
    console.log('Mock API call:', { url, config });
    return Promise.resolve({ success: true });
  });

  // Reset Auth mocks - use mock functions instead of direct assignment
  mockAuthContext.signIn.mockImplementation(() => Promise.resolve());
  mockAuthContext.signOut.mockImplementation(() => Promise.resolve());
  mockAuthContext.getAuthToken.mockImplementation(() => Promise.resolve('test-token'));

  // Clear all other mocks
  jest.clearAllMocks();
};

// Reset modules to avoid circular dependencies
export const resetModules = () => {
  console.log('Resetting modules...');
  jest.resetModules();
};
