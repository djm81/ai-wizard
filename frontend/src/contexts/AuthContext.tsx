import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeGoogleAuth, signInWithGoogle, signOut as firebaseSignOut, getIdToken, User } from 'auth/fedcmAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
    let unsubscribe = () => {};
    
    const initAuth = async () => {
      try {
        await initializeGoogleAuth();
        const auth = getAuth();
        
        if (auth) {
          unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            if (firebaseUser) {
              setUser({
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid
              });
            } else {
              setUser(null);
            }
            setLoading(false);
          });
        } else {
          console.error('Auth instance is undefined');
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initAuth();
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