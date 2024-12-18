import { z } from 'zod';
import type { AIInteractionPartial, AIInteraction } from '../types/aiInteraction';

export const aiInteractionSchema = z.object({
  id: z.number().optional(),
  project_id: z.number().optional(),
  user_id: z.number().optional(),
  prompt: z.string()
    .min(10, "Prompt must be at least 10 characters long")
    .max(1000, "Prompt must not exceed 1000 characters"),
  response: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
  error: z.string().optional()
});

export const validateAIInteraction = (data: unknown): AIInteractionPartial => {
  return aiInteractionSchema.parse(data);
};

export const assertCompleteAIInteraction = (data: AIInteractionPartial): asserts data is AIInteraction => {
  if (!data.id || !data.project_id || !data.user_id || !data.response ||
      !data.created_at || !data.updated_at) {
    throw new Error('Incomplete AI Interaction');
  }
};
