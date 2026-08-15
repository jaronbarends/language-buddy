import { NextRequest, NextResponse } from 'next/server';

import { AIEvaluationRequestBodySchema, getBodyValidationError } from '@/lib/aiRequest';
import { postToGemini } from '@/lib/geminiGateway';

export type EvaluationInteractionConfig = {
  input: string;
  previous_interaction_id: string;
  system_instruction: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
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
  };

  return postToGemini(config, request.signal);
}
