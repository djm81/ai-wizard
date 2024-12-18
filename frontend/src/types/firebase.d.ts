declare module 'firebase/app' {
  interface FirebaseApp {
    name: string;
    options: object;
  }

  export function initializeApp(options: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }): FirebaseApp;
}

declare module '../config/firebase' {
  import type { FirebaseApp } from 'firebase/app';
  const app: FirebaseApp;
  export { app };
}

declare module 'firebase/analytics' {
  import { FirebaseApp } from 'firebase/app';

  export interface Analytics {
    app: FirebaseApp;
  }

  export interface AnalyticsCallOptions {
    global: boolean;
  }

  export function getAnalytics(app: FirebaseApp): Analytics;
  export function logEvent(
    analytics: Analytics,
    eventName: string,
    eventParams?: Record<string, any>,
    options?: AnalyticsCallOptions
  ): void;
}

declare module 'firebase/firestore' {
  import { FirebaseApp } from 'firebase/app';

  export interface Firestore {
    app: FirebaseApp;
    type: string;
  }

  export interface DocumentData {
    [key: string]: any;
  }

  export type CollectionReference<T = DocumentData> = {
    id: string;
    path: string;
  };

  export function getFirestore(app: FirebaseApp): Firestore;
  export function collection(firestore: Firestore, path: string): CollectionReference;
  export function addDoc<T>(reference: CollectionReference, data: T): Promise<{ id: string }>;
  export function serverTimestamp(): any;
}

import type { ImportMetaEnv } from '../env';

export {};
