import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAIInteractions } from '../api';
import { AIInteraction, AIInteractionCreate } from '../types/aiInteraction';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AIInteractions: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getProjectInteractions, createInteraction } = useAIInteractions();

  const isValidPrompt = newPrompt.trim().length >= 10;

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        if (!projectId) {
          setError('No project ID provided');
          return;
        }
        const data = await getProjectInteractions(parseInt(projectId, 10));
        if (mounted) {
          setInteractions(data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch interactions');
          console.error('Error fetching interactions:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    let mounted = true;
    fetchInteractions();
    return () => { mounted = false; };
  }, [projectId, getProjectInteractions]);

  const handleCreateInteraction = async () => {
    if (!isValidPrompt || submitting || !projectId) return;

    setSubmitting(true);
    try {
      const newInteraction = await createInteraction(parseInt(projectId, 10), {
        prompt: newPrompt.trim()
      });
      setInteractions(prev => [newInteraction, ...prev]);
      setNewPrompt('');
    } catch (err) {
      setError('Failed to create interaction');
      console.error('Error creating interaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          New Prompt
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Enter your prompt"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          required
          error={newPrompt.length > 0 && !isValidPrompt}
          helperText={newPrompt.length > 0 && !isValidPrompt ? 
            "Prompt must be at least 10 characters" : ""}
          disabled={submitting}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleCreateInteraction}
          disabled={!isValidPrompt || submitting}
          sx={{
            opacity: (!isValidPrompt || submitting) ? 0.6 : 1,
            '&:disabled': {
              backgroundColor: 'grey.300',
              color: 'grey.500'
            }
          }}
        >
          {submitting ? 'Processing...' : 'Create Interaction'}
        </Button>
      </Paper>

      <Box>
        {interactions.map((interaction) => (
          <Accordion key={interaction.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography variant="subtitle1">
                  {interaction.prompt.slice(0, 100)}
                  {interaction.prompt.length > 100 ? '...' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(interaction.created_at).toLocaleString()}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Prompt
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography>{interaction.prompt}</Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Response
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography>{interaction.response}</Typography>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default AIInteractions;