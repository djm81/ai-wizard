import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Container, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import { useProjects } from '../api';
import { Project } from '../types/project';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const { getProjects, createProject } = useProjects();

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [getProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      try {
        await createProject({ name: newProjectName, description: '' });
        setNewProjectName('');
        fetchProjects();
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h2">Projects</Typography>
      <TextField
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        label="New Project Name"
      />
      <Button onClick={handleCreateProject}>Create Project</Button>
      <List>
        {projects.map((project) => (
          <ListItem key={project.id}>
            <ListItemText primary={project.name} secondary={project.description} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Projects;