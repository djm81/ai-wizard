import React, { useState, useEffect } from 'react';
import { initializeGoogleAuth, signInWithGoogle, signOut } from './auth/fedcmAuth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeGoogleAuth().catch(error => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {user ? (
          <>
            <p>Welcome, {user.displayName}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <button onClick={handleSignIn}>Sign In with Google</button>
        )}
      </header>
      {/* Rest of your app content */}
    </div>
  );
}

export default App;