import { z } from 'zod';

const SegmentTypeSchema = z.enum(['text', 'userInput', 'suggestion']);

const SegmentSchema = z.object({
  type: SegmentTypeSchema,
  text: z
    .string()
    .describe(
      'part of a comment that demarcated regular comment text, text referring to user input or text containing a suggestion'
    ),
});

const CommentSchema = z.object({
  segments: z.array(SegmentSchema).describe('a complete comment'),
});

export const AIEvaluationSchema = z.object({
  comments: z.array(CommentSchema),
});

export const AIEvaluationJSONSchema = z.toJSONSchema(AIEvaluationSchema);

export type SegmentType = z.infer<typeof SegmentTypeSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type AIEvaluation = z.infer<typeof AIEvaluationSchema>;
export type AIEvaluationJSONSchemaType = typeof AIEvaluationJSONSchema;
