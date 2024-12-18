export interface User {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
}

declare module 'firebase/auth' {
    import { FirebaseApp } from 'firebase/app';

    export interface User {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        getIdToken(): Promise<string>;
    }

    export interface Auth {
        app: FirebaseApp;
        currentUser: User | null;
        signOut(): Promise<void>;
    }

    export interface UserCredential {
        user: User;
    }

    export class GoogleAuthProvider {
        static credential(idToken: string | null, accessToken: string | undefined): AuthCredential;
    }

    export interface AuthCredential {
        providerId: string;
        signInMethod: string;
    }

    export function getAuth(app: FirebaseApp): Auth;
    export function signInWithCredential(auth: Auth, credential: AuthCredential): Promise<UserCredential>;
}

declare module 'auth/fedcmAuth' {
    import type { User } from './auth';

    export function initializeGoogleAuth(): Promise<void>;
    export function signInWithGoogle(): Promise<User>;
    export function signOut(): Promise<void>;
    export function getIdToken(): Promise<string>;
    export type { User };
}
