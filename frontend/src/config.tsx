const mockEnv = {
  PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
  PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
  PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
  PUBLIC_FIREBASE_APP_ID: 'test-app-id',
  PUBLIC_GOOGLE_CLIENT_ID: 'test-client-id',
  PUBLIC_API_URL: 'http://localhost:8000'
};

// For tests, use mock values
// For runtime, use import.meta.env
export const ENV =
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
    ? mockEnv
    : {
        PUBLIC_FIREBASE_API_KEY: import.meta.env.PUBLIC_FIREBASE_API_KEY,
        PUBLIC_FIREBASE_AUTH_DOMAIN: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
        PUBLIC_FIREBASE_PROJECT_ID: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
        PUBLIC_FIREBASE_STORAGE_BUCKET: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
        PUBLIC_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        PUBLIC_FIREBASE_APP_ID: import.meta.env.PUBLIC_FIREBASE_APP_ID,
        PUBLIC_GOOGLE_CLIENT_ID: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID,
        PUBLIC_API_URL: import.meta.env.PUBLIC_API_URL
      };

export const getEnvConfig = () => ({
  API_URL: ENV.PUBLIC_API_URL
});
