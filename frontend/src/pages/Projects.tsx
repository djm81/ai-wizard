import React, { useEffect, useState, useCallback } from 'react';
import { useProjects } from '../api';
import { Project, ProjectCreate } from '../types/project';
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  DialogContentText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { ApiResponse } from '../types/api';

interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const projectsApi = useProjects();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Validation state
  const isValidProjectName = newProjectName.trim().length >= 3;

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      details: error
    };

    if (error instanceof Error) {
      apiError.message = error.message;
    } else if (typeof error === 'string') {
      apiError.message = error;
    }

    setError(apiError);
    setSnackbarOpen(true);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    const fetchProjects = async () => {
      try {
        setError(null);
        const data = await projectsApi.getProjects();
        if (mounted) {
          setProjects(data);
        }
      } catch (err) {
        if (mounted) {
          handleError(err, 'fetching projects');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [projectsApi, handleError]);

  const handleCreateProject = async () => {
    if (!isValidProjectName || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const projectData: ProjectCreate = {
        name: newProjectName.trim(),
        description: ''
      };

      const newProject = await projectsApi.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setNewProjectName('');
      setSnackbarOpen(true);
    } catch (err) {
      handleError(err, 'creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await projectsApi.deleteProject(selectedProject.id);
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setDeleteConfirmOpen(false);
      setDialogOpen(false);
      setSelectedProject(null);
      setSnackbarOpen(true);
    } catch (err) {
      handleError(err, 'deleting project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          label="New Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          sx={{ mr: 2 }}
          required
          error={newProjectName.length > 0 && !isValidProjectName}
          helperText={newProjectName.length > 0 && !isValidProjectName ?
            "Project name must be at least 3 characters" : ""}
          disabled={isSubmitting}
        />
        <Button
          variant="contained"
          onClick={handleCreateProject}
          disabled={!isValidProjectName || isSubmitting}
          sx={{
            opacity: (!isValidProjectName || isSubmitting) ? 0.6 : 1,
            '&:disabled': {
              backgroundColor: 'grey.300',
              color: 'grey.500'
            }
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </Box>

      <List>
        {projects.map((project) => (
          <ListItem key={project.id} disablePadding>
            <ListItemButton
              onClick={() => handleProjectClick(project)}
              disabled={isSubmitting}
            >
              <ListItemText
                primary={project.name}
                secondary={`Created: ${new Date(project.created_at || '').toLocaleDateString()}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={dialogOpen}
        onClose={() => !isSubmitting && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>{selectedProject.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Project Details
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">
                    Created: {new Date(selectedProject.created_at || '').toLocaleString()}
                  </Typography>
                  {selectedProject.description && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedProject.description}
                    </Typography>
                  )}
                </Paper>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/projects/${selectedProject.id}/ai-interactions`}
                  fullWidth
                  disabled={isSubmitting}
                >
                  View AI Interactions
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteClick}
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    opacity: isSubmitting ? 0.6 : 1,
                    '&:disabled': {
                      borderColor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  Delete Project
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !isSubmitting && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be undone and all associated AI interactions will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              opacity: isSubmitting ? 0.6 : 1,
              '&:disabled': {
                backgroundColor: 'error.light',
                color: 'grey.100'
              }
            }}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error ? error.message : "Operation completed successfully"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Projects;
