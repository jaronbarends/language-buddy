// export async function sendChatMessage(systemInstruction, previousInteractionId): Promise {
export type AIChatResult =
  | {
      success: true;
      interactionId: string;
      message: string;
    }
  | {
      success: false;
    };

export async function sendChatMessage() {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
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
