/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  setupFiles: ['<rootDir>/src/jest.polyfills.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^auth/(.*)$': '<rootDir>/src/auth/$1',
    '^config$': '<rootDir>/src/__mocks__/env',
//    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^axios$': require.resolve('axios'),
    '^@/(.*)$': '<rootDir>/src/$1',
    'hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^__mocks__/(.*)$': '<rootDir>/src/__mocks__/$1',
    'firebase/analytics': '<rootDir>/src/__mocks__/firebase/analytics.ts',
    'firebase/firestore': '<rootDir>/src/__mocks__/firebase/firestore.ts',
    'firebase/app': '<rootDir>/src/__mocks__/firebase/app.ts',
    'firebase/auth': '<rootDir>/src/__mocks__/firebase/auth.ts',
    '../config/firebase': '<rootDir>/src/__mocks__/firebase/config.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      useESM: true,
      isolatedModules: true
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@firebase|firebase|@testing-library|node-fetch|web-streams-polyfill)/)'
  ],
  resetMocks: false,
  restoreMocks: false,
  clearMocks: false
};
