import 'dotenv/config';

import { type ChatMessageParams } from '@/app/api/ai/chat/route';

const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? '/api/aiMock/chat' : '/api/ai/chat';

export type AIChatError = {
  success: false;
  error: string;
  status: number;
  name: string;
};

export type AIChatResult =
  | {
      success: true;
      interactionId: string;
      message: string;
    }
  | AIChatError;

export async function sendChatMessage({
  systemInstruction,
  previousInteractionId,
  input,
  abortSignal,
}: ChatMessageParams): Promise<AIChatResult> {
  const body = JSON.stringify({
    systemInstruction,
    previousInteractionId,
    input,
  });
  const res: Response = await postChatMessage({ body, abortSignal });
  return toAIChatResult(res);
}

async function postChatMessage({
  body,
  abortSignal,
}: {
  body: BodyInit;
  abortSignal: AbortSignal | undefined;
}) {
  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortSignal,
  });
  return res;
}

export async function toAIChatResult(res: Response): Promise<AIChatResult> {
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
