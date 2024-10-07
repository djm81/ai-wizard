import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Container, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import { useAIInteractions } from '../api';
import { AIInteraction } from '../types/aiInteraction';

const AIInteractions: React.FC = () => {
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const { getAIInteractions, createAIInteraction } = useAIInteractions();

  const fetchInteractions = useCallback(async () => {
    try {
      const data = await getAIInteractions();
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching AI interactions:', error);
    }
  }, [getAIInteractions]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleCreateInteraction = async () => {
    if (newPrompt.trim()) {
      try {
        await createAIInteraction({ prompt: newPrompt, response: 'Processing...' });
        setNewPrompt('');
        fetchInteractions();
      } catch (error) {
        console.error('Error creating AI interaction:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h2">AI Interactions</Typography>
      <TextField
        value={newPrompt}
        onChange={(e) => setNewPrompt(e.target.value)}
        label="New Prompt"
      />
      <Button onClick={handleCreateInteraction}>Create Interaction</Button>
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