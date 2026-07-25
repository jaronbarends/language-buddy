import { type chatMessageParams } from '@/app/api/ai/chat/route';

export type AIChatResult =
  | {
      success: true;
      interactionId: string;
      message: string;
    }
  | {
      success: false;
    };

export async function sendChatMessage({
  systemInstruction,
  previousInteractionId,
  input,
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
  });
  console.log('response in service', res);
  if (!res.ok) {
    const body = await res.json();
    // eslint-disable-next-line no-console
    console.error(body.error);
    return { success: false };
  }

  const { id, text } = await res.json();
  return {
    success: true,
    interactionId: id,
    message: text,
  };
}
