import React from 'react';
import { Typography, Container } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container>
      <Typography variant="h2">Welcome to AI Wizard</Typography>
      <Typography variant="body1">
        AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications.
      </Typography>
    </Container>
  );
};

export default Home;
