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
      status: number;
    };

export async function sendChatMessage({
  systemInstruction,
  previousInteractionId,
  input,
  abortSignal,
}: chatMessageParams): Promise<AIChatResult> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      systemInstruction,
      previousInteractionId,
      input,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortSignal,
  });
  console.log('response in service', res);
  if (!res.ok) {
    const body = await res.json();
    return { success: false, error: body.error, status: body.status };
  }

  const { id, text } = await res.json();
  return {
    success: true,
    interactionId: id,
    message: text,
  };
}
