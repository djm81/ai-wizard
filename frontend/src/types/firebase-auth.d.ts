import type { FirebaseApp } from 'firebase/app';

export interface IdTokenResult {
  token: string;
  claims: Record<string, any>;
  authTime: string;
  issuedAtTime: string;
  expirationTime: string;
  signInProvider: string | null;
  signInSecondFactor: string | null;
}

export interface MockFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  providerData: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }>;
  refreshToken: string;
  tenantId: string | null;
  phoneNumber: string | null;
  providerId: string;
  getIdToken(): Promise<string>;
  getIdTokenResult(): Promise<IdTokenResult>;
  delete(): Promise<void>;
  reload(): Promise<void>;
  toJSON(): object;
}

export interface MockAuthState {
  user: MockFirebaseUser | null;
  loading: boolean;
}
