import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';

// genai no longer uses a single ApiError, but generated hierarchy of specific error classes. Define what we need
type GeminiApiError = Error & { status?: number; error?: { code?: string } };

const MODEL = 'gemini-3.1-flash-lite';

export type chatMessageParams = {
  input: string;
  systemInstruction: string;
  previousInteractionId?: string;
  abortSignal?: AbortSignal;
};

type InteractionConfig = {
  model: string;
  input: string;
  previous_interaction_id?: string;
  system_instruction?: string;
};

export async function POST(request: NextRequest) {
  const { systemInstruction, previousInteractionId, input } =
    (await request.json()) as chatMessageParams;

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message, name }, { status: status ?? 500 });
  }
}

async function createAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY. Add it to environment variables.');
    return;
  }

  return new GoogleGenAI({ apiKey });
}
