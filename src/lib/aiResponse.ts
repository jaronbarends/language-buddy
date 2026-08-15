import { z } from 'zod';

const SegmentTypeSchema = z.enum(['text', 'userInput', 'suggestion']);
export type SegmentType = z.infer<typeof SegmentTypeSchema>;

const SegmentSchema = z.object({
  type: SegmentTypeSchema,
  text: z.string(),
});
const CommentSchema = z.object({
  segments: z.array(SegmentSchema),
});
export type Comment = z.infer<typeof CommentSchema>;

export const AIEvaluationSchema = z.object({
  comments: z.array(CommentSchema),
});
export type AIEvaluation = z.infer<typeof AIEvaluationSchema>;
