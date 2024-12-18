/// <reference types="@rsbuild/core" />

export interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly PUBLIC_FIREBASE_APP_ID: string;
  readonly PUBLIC_GOOGLE_CLIENT_ID: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_ENVIRONMENT: string;
  readonly PROD?: boolean;
  readonly DEV?: boolean;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Augment the global scope
declare global {
  // Use var importMeta instead of import
  var importMeta: {
    env: ImportMetaEnv;
  };
}

export {};
