/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^config$': '<rootDir>/src/__mocks__/env',
    '^auth/(.*)$': '<rootDir>/src/__mocks__/auth',
    '^axios$': require.resolve('axios'),
    '^jest.setup$': '<rootDir>/src/jest.setup.ts'
  },
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: 'tsconfig.jest.json',
      useESM: true
    }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resetModules: true,
  automock: false,
  unmockedModulePathPatterns: [
    'node_modules/react/',
    'node_modules/react-dom/',
    'node_modules/@testing-library/'
  ]
};