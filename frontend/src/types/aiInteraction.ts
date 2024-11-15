export interface AIInteraction {
    id: number;
    project_id: number;
    user_id: number;
    prompt: string;
    response: string;
    created_at: string;
    updated_at: string;
}

export interface AIInteractionCreate {
    prompt: string;
} 