import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemini-3.1-flash-lite';

export async function POST(request: NextRequest) {
  // do we need to send systemInstruction?
  // or always send it in request params, but only use it if we don't have prevId
  // const { systemInstruction, message, previousInteractionId } = await request.json();
  const message = 'what is the capital of the netherlands?';

  const ai = await createAI();
  const response = await ai.interactions.create({
    model: MODEL,
    input: message,
  });

  console.log(response);
  const data = {
    id: response.id,
    text: response.output_text,
  };
  return NextResponse.json(data);
}

async function createAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY. Add it to environment variables.');
    return;
  }

  return new GoogleGenAI({ apiKey });
}
