import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';

import { AIRequestBody, getBodyValidationError } from '@/lib/aiRequest';

// genai no longer uses a single ApiError, but generated hierarchy of specific error classes. Define what we need
type GeminiApiError = Error & { status?: number; error?: { code?: string }; body?: string };

const MODEL = 'gemini-3.1-flash-lite';

type InteractionConfig = {
  model: string;
  input: string;
  previous_interaction_id?: string;
  system_instruction?: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = AIRequestBody.safeParse(body);
  if (!validation.success) {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const { systemInstruction, previousInteractionId, input } = validation.data;

  const ai = await createAI();

  if (!ai) {
    return NextResponse.json(
      { error: 'Could not create ai object', name: 'aiCreationError' },
      { status: 500 }
    );
  }

  const config: InteractionConfig = {
    model: MODEL,
    input,
    system_instruction: systemInstruction,
  };
  if (previousInteractionId) {
    config.previous_interaction_id = previousInteractionId;
  }
  const options = { fetchOptions: { signal: request.signal } };

  try {
    const response = await ai.interactions.create(config, options);

    const data = {
      id: response.id,
      text: response.output_text,
    };

    return NextResponse.json(data);
  } catch (error) {
    const name = error instanceof Error ? error.name : undefined;
    const status = error instanceof Error ? (error as GeminiApiError).status : 500;
    const rawBody = error instanceof Error ? (error as GeminiApiError).body : undefined;
    const message =
      extractApiErrorMessage(rawBody) ?? (error instanceof Error ? error.message : 'Unknown error');

    // eslint-disable-next-line no-console
    console.log({ error: message, name }, { status: status ?? 500 });
    return NextResponse.json({ error: message, name }, { status: status ?? 500 });
  }
}

function extractApiErrorMessage(rawBody: string | undefined): string | undefined {
  if (!rawBody) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawBody);
    const errorObject = Array.isArray(parsed) ? parsed[0]?.error : parsed?.error;
    return errorObject?.message;
  } catch {
    return undefined;
  }
}

async function createAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.error('Missing GEMINI_API_KEY. Add it to environment variables.');
    return;
  }

  return new GoogleGenAI({ apiKey });
}
