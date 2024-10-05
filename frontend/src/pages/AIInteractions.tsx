import React, { useState, useEffect } from 'react';
import { Typography, Container, List, ListItem, ListItemText } from '@mui/material';
import { getAIInteractions } from '../api';
import { AIInteraction } from '../types/aiInteraction';

const AIInteractions: React.FC = () => {
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);

  useEffect(() => {
    const fetchInteractions = async () => {
      const data = await getAIInteractions();
      setInteractions(data);
    };
    fetchInteractions();
  }, []);

  return (
    <Container>
      <Typography variant="h2">AI Interactions</Typography>
      <List>
        {interactions.map((interaction) => (
          <ListItem key={interaction.id}>
            <ListItemText primary={interaction.prompt} secondary={interaction.response} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default AIInteractions;