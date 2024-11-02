import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeGoogleAuth, signInWithGoogle, signOut as firebaseSignOut, getIdToken, User } from 'auth/fedcmAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();

    if (!auth) {
      console.error('Auth instance is undefined');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // const user: User = {
        //   displayName: firebaseUser.displayName,
        //   email: firebaseUser.email,
        //   photoURL: firebaseUser.photoURL,
        //   uid: firebaseUser.uid
        // };
        try {
          setUser(firebaseUser);
        } catch (error) {
          console.error('Failed to set user:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    initializeGoogleAuth()
      .then(() => {
      setLoading(false);
    })
    .catch((error: Error) => {
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

  const getAuthToken = async (): Promise<string | null> => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};