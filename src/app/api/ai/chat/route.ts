import { NextRequest, NextResponse } from 'next/server';

import { AIChatRequestBodySchema, getBodyValidationError } from '@/lib/aiRequest';
import { postToGemini } from '@/lib/geminiGateway';

export type ChatInteractionConfig = {
  input: string;
  previous_interaction_id?: string;
  system_instruction: string;
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const validation = AIChatRequestBodySchema.safeParse(body);
  if (!validation.success) {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const { systemInstruction, previousInteractionId, input } = validation.data;
  const config: ChatInteractionConfig = {
    input,
    system_instruction: systemInstruction,
    previous_interaction_id: previousInteractionId,
  };

  return postToGemini(config, request.signal);
}
