const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.ts',
    '^axios$': 'axios/dist/node/axios.cjs',
    '^punycode$': path.resolve(__dirname, 'node_modules/punycode/punycode.js'),
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)',
  ],
};