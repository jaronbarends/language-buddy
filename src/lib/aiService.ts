// export async function sendChatMessage(systemInstruction, previousInteractionId): Promise {
export async function sendChatMessage() {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    // body: JSON.stringify('')
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(res);
  if (!res.ok) {
    const body = await res.json();
    // eslint-disable-next-line no-console
    console.error(body.error);
    throw new Error('Cannot send message');
  }
  return res.json();
  // check result
  // return ai response text or error
}
