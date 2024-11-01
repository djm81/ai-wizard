declare module 'config' {
    export const ENV: {
        PUBLIC_FIREBASE_API_KEY: string;
        PUBLIC_FIREBASE_AUTH_DOMAIN: string;
        PUBLIC_FIREBASE_PROJECT_ID: string;
        PUBLIC_FIREBASE_STORAGE_BUCKET: string;
        PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
        PUBLIC_FIREBASE_APP_ID: string;
        PUBLIC_GOOGLE_CLIENT_ID: string;
    };
}