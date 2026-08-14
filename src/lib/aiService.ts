import 'dotenv/config';

import { AIRequestParams } from '@/lib/aiRequest';

const REAL_API_ENDPOINT = '/api/ai';
const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? '/api/aiMock/chat' : REAL_API_ENDPOINT;

const EVALUATION_ENDPOINT =
  process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? '/api/aiMock/evaluation' : REAL_API_ENDPOINT;

export type AIError = {
  success: false;
  error: string;
  status: number;
  name: string;
};

export type AIResult =
  | {
      success: true;
      interactionId: string;
      message: string;
    }
  | AIError;

export type AIRole = 'chat' | 'evaluation';

export async function sendAIRequest(
  { systemInstruction, previousInteractionId, input, abortSignal }: AIRequestParams,
  aiRole: AIRole
): Promise<AIResult> {
  const body = JSON.stringify({
    systemInstruction,
    previousInteractionId,
    input,
  });
  const endpoint = aiRole === 'chat' ? CHAT_ENDPOINT : EVALUATION_ENDPOINT;
  const res: Response = await postRequest({ body, abortSignal, endpoint });
  return toAIResult(res);
}

async function postRequest({
  body,
  abortSignal,
  endpoint,
}: {
  body: BodyInit;
  abortSignal: AbortSignal | undefined;
  endpoint: string;
}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortSignal,
  });
  return res;
}

export async function toAIResult(res: Response): Promise<AIResult> {
  if (!res.ok) {
    const body = await res.json();
    return {
      success: false,
      error: body.error,
      name: body.name,
      status: res.status,
    };
  }

  const { id, text } = await res.json();

  return {
    success: true,
    interactionId: id,
    message: text,
  };
}
