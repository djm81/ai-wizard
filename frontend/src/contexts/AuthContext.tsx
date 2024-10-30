import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, initializeGoogleAuth, signInWithGoogle, signOut as firebaseSignOut, getIdToken } from '../auth/fedcmAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  getAuthToken: () => Promise<string | null>;
}

// Initialize context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
  getAuthToken: async () => null
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    initializeGoogleAuth().catch((error: Error) => {
      console.error('Failed to initialize Google Auth:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getAuthToken = async () => {
    return getIdToken();
  };

  const value = {
    user,
    signIn,
    signOut: handleSignOut,
    loading,
    getAuthToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};