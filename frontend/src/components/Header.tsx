import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signIn, signOut, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AI Wizard
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/projects">
              Projects
            </Button>
            <Button color="inherit" component={Link} to="/ai-interactions">
              AI Interactions
            </Button>
            <Button color="inherit" onClick={signOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={signIn}>
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;