import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { authState } from '@/__mocks__/auth';
import type { MockFirebaseUser } from '@/types/firebase-auth';
import { configure as configureTL } from '@testing-library/react';
import type { ImportMetaEnv } from './env';

// Configure Testing Library
configureTL({
  testIdAttribute: 'data-testid',
});

// Create environment mock that matches ImportMetaEnv
const mockEnv: ImportMetaEnv = {
  PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
  PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
  PUBLIC_FIREBASE_APP_ID: 'test-app-id',
  PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id',
  PUBLIC_API_URL: 'http://localhost:8000',
  PUBLIC_ENVIRONMENT: 'test',
  DEV: false,
  PROD: false
};

// Set process.env with only string values
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  PUBLIC_FIREBASE_API_KEY: mockEnv.PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN: mockEnv.PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID: mockEnv.PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET: mockEnv.PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: mockEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID: mockEnv.PUBLIC_FIREBASE_APP_ID,
  PUBLIC_GOOGLE_CLIENT_ID: mockEnv.PUBLIC_GOOGLE_CLIENT_ID,
  PUBLIC_API_URL: mockEnv.PUBLIC_API_URL,
  PUBLIC_ENVIRONMENT: mockEnv.PUBLIC_ENVIRONMENT
};

// Mock import.meta before any imports
if (typeof window === 'undefined') {
  (global as any).window = {};
}

// Use properly typed global for import.meta
(global as any).importMeta = {
  env: mockEnv
};

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn().mockReturnValue(Date.now())
};

// Mock TextEncoder/Decoder for Firebase
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

// Test environment control
export const TestEnvironment = {
  mockUUID: 'test-uuid-123',
  loggingEnabled: false,
  mockResponses: new Map<string, unknown>(),
  addMockResponse: (url: string, response: unknown): void => {
    TestEnvironment.mockResponses.set(url, response);
  },
  reset: (): void => {
    TestEnvironment.mockResponses.clear();
    TestEnvironment.loggingEnabled = false;
  }
};

// Suppress router warnings in tests
beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router')) {
      return;
    }
    originalWarn.apply(console, args);
  });
});

// Reset test environment before each test
beforeEach(() => {
  TestEnvironment.reset();
  authState.reset();
});
