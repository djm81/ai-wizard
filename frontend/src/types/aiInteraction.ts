import { z } from 'zod';

// Validation schema
export const aiInteractionSchema = z.object({
  prompt: z.string()
    .min(10, "Prompt must be at least 10 characters long")
    .max(1000, "Prompt must not exceed 1000 characters"),
});

// Types derived from schema
export type AIInteractionCreate = z.infer<typeof aiInteractionSchema>;

export interface AIInteraction extends AIInteractionCreate {
  id: number;
  user_id: number;
  project_id: number;
  response: string;
  created_at: string;
  updated_at: string;
}
