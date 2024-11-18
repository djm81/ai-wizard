import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAIInteractions } from '../api';
import type { AIInteraction } from '../types/aiInteraction';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

const AIInteractions: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const { getProjectInteractions, createInteraction } = useAIInteractions();

  // Use AbortController for cleanup
  useEffect(() => {
    const abortController = new AbortController();

    const fetchInteractions = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getProjectInteractions(parseInt(projectId));
        if (!abortController.signal.aborted) {
          setInteractions(data);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to fetch interactions');
          console.error('Error:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInteractions();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [projectId]); // Only depend on projectId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !prompt.trim()) return;

    try {
      const newInteraction = await createInteraction(parseInt(projectId), { prompt });
      setInteractions(prev => [...prev, newInteraction]);
      setPrompt('');
    } catch (err) {
      setError('Failed to create interaction');
      console.error('Error:', err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>AI Interactions</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={!prompt.trim()}>
          Create Interaction
        </Button>
      </Box>

      {interactions.map((interaction) => (
        <Box key={interaction.id} sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>{interaction.prompt}</Typography>
          <Typography variant="body1">{interaction.response}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default AIInteractions;
