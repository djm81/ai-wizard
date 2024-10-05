import React, { useState, useEffect } from 'react';
import { Typography, Container, List, ListItem, ListItemText } from '@mui/material';
import { getProjects } from '../api';
import { Project } from '../types/project';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <Container>
      <Typography variant="h2">Projects</Typography>
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