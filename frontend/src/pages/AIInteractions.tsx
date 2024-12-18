import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAIInteractions } from '../api';
import type { AIInteraction } from '../types/aiInteraction';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 1000;

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
          if (err instanceof Error) {
            console.error('Error:', err.message);
          } else {
            console.error('Unknown error occurred');
          }
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInteractions().catch(err => {
      if (!abortController.signal.aborted) {
        console.error('Unhandled error in fetchInteractions:', err);
        setError('An unexpected error occurred');
      }
    });

    return () => {
      abortController.abort();
    };
  }, [projectId, getProjectInteractions]); // Add getProjectInteractions to deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !prompt.trim()) return;

    try {
      setError(null);
      const newInteraction = await createInteraction(parseInt(projectId), { prompt });
      setInteractions(prev => [...prev, newInteraction]);
      setPrompt('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create interaction');
      }
      console.error('Error:', err);
    }
  };

  const isPromptValid = prompt.length >= MIN_PROMPT_LENGTH && prompt.length <= MAX_PROMPT_LENGTH;
  const remainingChars = MAX_PROMPT_LENGTH - prompt.length;
  const helperText = prompt.length > 0
    ? `${remainingChars} characters remaining${prompt.length < MIN_PROMPT_LENGTH
      ? `, need ${MIN_PROMPT_LENGTH - prompt.length} more characters`
      : ''}`
    : `Minimum ${MIN_PROMPT_LENGTH} characters required`;

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>AI Interactions</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          multiline
          rows={3}
          error={prompt.length > 0 && !isPromptValid}
          helperText={helperText}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!isPromptValid}
        >
          Create Interaction
        </Button>
      </Box>

      {interactions.map((interaction) => (
        <Box key={interaction.id} sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>{interaction.prompt}</Typography>
          <Typography variant="body1">{interaction.response}</Typography>
        </Box>
      ))}

      {interactions.length === 0 && !loading && (
        <Typography color="text.secondary">
          No interactions yet. Start by creating one!
        </Typography>
      )}
    </Box>
  );
};

export default AIInteractions;
