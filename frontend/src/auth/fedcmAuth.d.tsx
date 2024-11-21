declare module 'auth/fedcmAuth' {
    export function initializeGoogleAuth(): Promise<void>;
    export function signInWithGoogle(): Promise<User>;
    export function signOut(): Promise<void>;
    export function getIdToken(): Promise<string>;
    export interface User {
        displayName: string | null;
        email: string | null;
        photoURL: string | null;
        uid: string;
    }
}
