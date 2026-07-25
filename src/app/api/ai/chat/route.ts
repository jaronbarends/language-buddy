import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemini-3.1-flash-lite';
// const MODEL = 'non-exsiting-to-force-error';

export type chatMessageParams = {
  input: string;
  systemInstruction: string;
  previousInteractionId?: string;
};

type InteractionConfig = {
  model: string;
  input: string;
  previous_interaction_id?: string;
  system_instruction?: string;
};

export async function POST(request: NextRequest) {
  // do we need to send systemInstruction?
  // or always send it in request params, but only use it if we don't have prevId
  // const { systemInstruction, message, previousInteractionId } = await request.json();
  const { systemInstruction, previousInteractionId, input } =
    (await request.json()) as chatMessageParams;
  // const message = 'what is the capital of the netherlands?';

  const ai = await createAI();

  if (!ai) {
    return NextResponse.json({ error: 'Could not create ai object' }, { status: 500 });
  }

  const config: InteractionConfig = {
    model: MODEL,
    input,
    system_instruction: systemInstruction,
  };
  if (previousInteractionId) {
    config.previous_interaction_id = previousInteractionId;
  }

  try {
    const response = await ai.interactions.create(config);

    // console.log('route response', response);
    const data = {
      id: response.id,
      text: response.output_text,
    };

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof Error ? (error as any).status : undefined;
    const code = error instanceof Error ? (error as any).error?.code : undefined;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message, status, code }, { status: status ?? 500 });
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
