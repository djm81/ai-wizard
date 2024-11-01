/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^auth/(.*)$': '<rootDir>/src/auth/$1',
    '^config$': '<rootDir>/src/__mocks__/config/env.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.tsx',
    '^axios$': require.resolve('axios'),
    '^./config/env$': '<rootDir>/src/__mocks__/config/env.ts',
  },
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: 'tsconfig.jest.json',
      diagnostics: {
        warnOnly: true
      }
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resetModules: true
};