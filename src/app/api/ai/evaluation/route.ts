import { NextRequest, NextResponse } from 'next/server';

import { AIEvaluationRequestBodySchema, getBodyValidationError } from '@/lib/aiRequest';
import { AIEvaluationJSONSchema, type AIEvaluationJSONSchemaType } from '@/lib/aiResponse';
import { postToGemini } from '@/lib/geminiGateway';

export type EvaluationInteractionConfig = {
  input: string;
  previous_interaction_id: string;
  system_instruction: string;
  response_format: {
    type: 'text';
    mime_type: 'application/json';
    schema: AIEvaluationJSONSchemaType;
  };
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const validation = AIEvaluationRequestBodySchema.safeParse(body);
  if (!validation.success) {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const { systemInstruction, previousInteractionId, input } = validation.data;
  const config: EvaluationInteractionConfig = {
    input,
    system_instruction: systemInstruction,
    previous_interaction_id: previousInteractionId,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: AIEvaluationJSONSchema,
    },
  };

  return postToGemini(config, request.signal);
}
