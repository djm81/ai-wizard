export interface AIInteractionBase {
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface AIInteractionCreate {
  prompt: string;
}

export interface AIInteraction extends AIInteractionBase {
  id: number;
  project_id: number;
  user_id: number;
  response: string;
  created_at: string;
  updated_at: string;
}

export interface AIInteractionPartial {
  prompt: string;
  id?: number;
  project_id?: number;
  user_id?: number;
  response?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
}
