import { z } from 'zod';

export const AIChatRequestBodySchema = z.object({
  input: z.string(),
  systemInstruction: z.string(),
  previousInteractionId: z.string().optional(),
});
export type AIChatRequestBody = z.infer<typeof AIChatRequestBodySchema>;

export const AIEvaluationRequestBodySchema = z.object({
  input: z.string(),
  systemInstruction: z.string(),
  previousInteractionId: z.string().min(1),
});
export type AIEvaluationRequestBody = z.infer<typeof AIEvaluationRequestBodySchema>;

export function getBodyValidationError(): string {
  // if you want, pass validation.error (type ZodError) and give more detailed feedback
  return 'AIRequestBody validation failed';
}
