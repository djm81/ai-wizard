/// <reference types="@rsbuild/core/types" />
import type { GoogleAuthAPI } from './types/google-auth';

// Extend Window interface
interface Window {
  google: GoogleAuthAPI;
  performance: Performance;
  crypto: Crypto;
}

// Extend global for Firebase mock
declare global {
  var mockFirebaseUser: import('firebase/auth').User;
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
    }
  }
}

export {};
