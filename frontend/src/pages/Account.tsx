import React from 'react';
import { Box, Paper, Typography, Button, Avatar, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Account: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={user.photoURL || undefined} 
            alt={user.displayName || 'User'} 
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h5">{user.displayName}</Typography>
            <Typography variant="body1" color="textSecondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Actions
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={signOut}
            sx={{ mt: 1 }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Account; 