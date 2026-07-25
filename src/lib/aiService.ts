import { type chatMessageParams } from '@/app/api/ai/chat/route';

export type AIChatResult =
  | {
      success: true;
      interactionId: string;
      message: string;
    }
  | {
      success: false;
      error: string;
      code: number;
      status: number;
      name: string;
    };

export async function sendChatMessage({
  systemInstruction,
  previousInteractionId,
  input,
  abortSignal,
}: chatMessageParams): Promise<AIChatResult> {
  const body = JSON.stringify({
    systemInstruction,
    previousInteractionId,
    input,
  });
  const res: Response = await postChatMessage({ body, abortSignal });
  console.log('response in service', res);
  return toAIChatResult(res);
}

async function postChatMessage({
  body,
  abortSignal,
}: {
  body: BodyInit;
  abortSignal: AbortSignal | undefined;
}) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortSignal,
  });
  return res;
}

async function toAIChatResult(res: Response): Promise<AIChatResult> {
  if (!res.ok) {
    const body = await res.json();
    return {
      success: false,
      error: body.error,
      code: body.code,
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
