import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Projects from '../pages/Projects';
import { useProjects } from '../api';

// Mock the API hook
jest.mock('../api', () => ({
  useProjects: jest.fn(),
}));

describe('Projects component', () => {
  const mockProjects = [
    { id: 1, name: 'Project 1', description: 'Description 1' },
    { id: 2, name: 'Project 2', description: 'Description 2' },
  ];

  beforeEach(() => {
    (useProjects as jest.Mock).mockReturnValue({
      getProjects: jest.fn().mockResolvedValue(mockProjects),
      createProject: jest.fn().mockResolvedValue({ id: 3, name: 'New Project', description: '' }),
    });
  });

  test('renders projects list', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  test('creates a new project', async () => {
    render(<Projects />);

    const input = screen.getByLabelText('New Project Name');
    const button = screen.getByText('Create Project');

    fireEvent.change(input, { target: { value: 'New Project' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(useProjects().createProject).toHaveBeenCalledWith({ name: 'New Project', description: '' });
    });
  });
});