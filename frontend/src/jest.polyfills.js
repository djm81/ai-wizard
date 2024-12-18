const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream } = require('stream/web');

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
  ReadableStream: { value: ReadableStream }
});

if (typeof global.import === 'undefined') {
  global.import = {
    meta: {
      env: {
        PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
        PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
        PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
        PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
        PUBLIC_FIREBASE_APP_ID: 'test-app-id',
        PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id',
        PUBLIC_API_URL: 'http://localhost:8000',
        PUBLIC_ENVIRONMENT: 'test'
      }
    }
  };
}
