export interface Project {
    id: number;
    name: string;
    description: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

// Type for creating a new project
export interface ProjectCreate {
    name: string;
    description: string;
}

// Type for updating an existing project
export interface ProjectUpdate {
    name?: string;
    description?: string;
}