import { jest } from '@jest/globals';

// Base mock interface matching Firebase's structure
interface MockFirebaseApp {
  name: '[DEFAULT]';
  options: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  automaticDataCollectionEnabled: boolean;
  // Required internal methods
  _getService: jest.Mock;
  _registerComponent: jest.Mock;
}

// Single source of truth for mock app
export const mockApp: MockFirebaseApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-messaging-sender-id',
    appId: 'mock-app-id'
  },
  automaticDataCollectionEnabled: true,
  _getService: jest.fn(),
  _registerComponent: jest.fn()
};

export const initializeApp = jest.fn().mockReturnValue(mockApp);

export const getApp = jest.fn().mockReturnValue({
  _registerComponent: jest.fn(),
  name: '[DEFAULT]'
});

export type FirebaseApp = typeof mockApp;
