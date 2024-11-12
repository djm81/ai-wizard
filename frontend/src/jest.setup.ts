import '@testing-library/jest-dom';
import { mockFunctions } from './__mocks__/auth';

// Mock fedcmAuth module using existing mockFunctions
jest.mock('auth/fedcmAuth', () => ({
  __esModule: true,
  initializeGoogleAuth: mockFunctions.initializeGoogleAuth,
  signInWithGoogle: mockFunctions.signInWithGoogle,
  signOut: mockFunctions.signOut,
  getIdToken: mockFunctions.getIdToken
}));
