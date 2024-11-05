/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^auth/(.*)$': '<rootDir>/src/auth/$1',
    '^config$': '<rootDir>/src/__mocks__/config/env.ts',
    '^./config/env$': '<rootDir>/src/__mocks__/config/env.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.tsx',
    '^axios$': require.resolve('axios')
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