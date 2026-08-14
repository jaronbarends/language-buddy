import { z } from 'zod';

export const AIRequestBody = z.object({
  input: z.string(),
  systemInstruction: z.string(),
  previousInteractionId: z.string().optional(),
});

export type AIRequestBody = z.infer<typeof AIRequestBody>;

export const bodyValidationError = 'AIRequestBody validation failed';

export function getBodyValidationError(): string {
  // if you want, pass validation.error (type ZodError) and give more detailed feedback
  return 'AIRequestBody validation failed';
}
