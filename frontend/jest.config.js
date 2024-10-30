/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.tsx',
    '^../auth/fedcmAuth$': '<rootDir>/src/__mocks__/auth/fedcmAuth.tsx',
    '^axios$': require.resolve('axios'),
    '^./config/env$': '<rootDir>/src/__mocks__/config/env.ts',
    '^../config/env$': '<rootDir>/src/__mocks__/config/env.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
      }
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  }
};