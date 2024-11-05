// Single source of truth for environment mocks
export const ENV = {
    PUBLIC_API_URL: 'http://localhost:8000/api',
    PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
    PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
    PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
    PUBLIC_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'mock-messaging-sender-id',
    PUBLIC_FIREBASE_APP_ID: 'mock-app-id',
    PUBLIC_GOOGLE_CLIENT_ID: 'mock-google-client-id'
};
  
export const getEnvConfig = () => ({
    API_URL: ENV.PUBLIC_API_URL
});

export default {
    ENV,
    getEnvConfig
};