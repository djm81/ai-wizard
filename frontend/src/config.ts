import type { ImportMetaEnv } from './env';

// Type definitions
type EnvConfig = {
  PUBLIC_FIREBASE_API_KEY: string;
  PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  PUBLIC_FIREBASE_PROJECT_ID: string;
  PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  PUBLIC_FIREBASE_APP_ID: string;
  PUBLIC_GOOGLE_CLIENT_ID: string;
  PUBLIC_API_URL: string;
  PUBLIC_ENVIRONMENT: string;
};

// Safe access to environment variables
const getEnvVar = (key: keyof ImportMetaEnv): string => {
  // Use process.env in test environment
  if (process.env.NODE_ENV === 'test') {
    return (process.env[key] || '') as string;
  }

  // Use import.meta.env in runtime
  if (typeof window !== 'undefined' && window.importMeta) {
    return (window.importMeta.env[key] || '') as string;
  }
  return (import.meta.env[key] || '') as string;
};

// Single environment configuration
export const ENV: EnvConfig = {
  PUBLIC_FIREBASE_API_KEY: getEnvVar('PUBLIC_FIREBASE_API_KEY'),
  PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN'),
  PUBLIC_FIREBASE_PROJECT_ID: getEnvVar('PUBLIC_FIREBASE_PROJECT_ID'),
  PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET'),
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvVar('PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  PUBLIC_FIREBASE_APP_ID: getEnvVar('PUBLIC_FIREBASE_APP_ID'),
  PUBLIC_GOOGLE_CLIENT_ID: getEnvVar('PUBLIC_GOOGLE_CLIENT_ID'),
  PUBLIC_API_URL: getEnvVar('PUBLIC_API_URL'),
  PUBLIC_ENVIRONMENT: getEnvVar('PUBLIC_ENVIRONMENT')
};

export const getConfig = () => ({
  API_URL: ENV.PUBLIC_API_URL,
  ENVIRONMENT: ENV.PUBLIC_ENVIRONMENT
});
