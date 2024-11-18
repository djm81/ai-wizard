/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^auth/(.*)$': '<rootDir>/src/auth/$1',
    '^config$': '<rootDir>/src/__mocks__/env',
    '^axios$': require.resolve('axios')
  },
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json'
    }]
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};
