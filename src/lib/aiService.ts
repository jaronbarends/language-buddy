import 'dotenv/config';

import { type AIChatRequestBody, AIEvaluationRequestBody } from '@/lib/aiRequest';
import { AIEvaluationSchema, type AIEvaluation } from '@/lib/aiResponse';

const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? '/api/aiMock/chat' : '/api/ai/chat';

const EVALUATION_ENDPOINT =
  process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? '/api/aiMock/evaluation' : '/api/ai/evaluation';

export type AIError = {
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
  | AIError;

export type AIEvaluationResult =
  | {
      success: true;
      interactionId: string;
      evaluation: AIEvaluation;
    }
  | AIError;

export async function sendAIChatRequest(
  { systemInstruction, previousInteractionId, input }: AIChatRequestBody,
  abortSignal: AbortSignal
): Promise<AIChatResult> {
  const body = JSON.stringify({
    systemInstruction,
    previousInteractionId,
    input,
  });
  const endpoint = CHAT_ENDPOINT;
  const res: Response = await postRequest({ body, abortSignal, endpoint });
  return toAIChatResult(res);
}

export async function sendAIEvaluationRequest(
  { systemInstruction, previousInteractionId, input }: AIEvaluationRequestBody,
  abortSignal: AbortSignal
): Promise<AIEvaluationResult> {
  const body = JSON.stringify({
    systemInstruction,
    previousInteractionId,
    input,
  });
  const endpoint = EVALUATION_ENDPOINT;
  const res: Response = await postRequest({ body, abortSignal, endpoint });
  return toAIEvaluationResult(res);
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

export async function toAIEvaluationResult(res: Response): Promise<AIEvaluationResult> {
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
  const rawEvaluation = JSON.parse(text);
  const validation = AIEvaluationSchema.safeParse(rawEvaluation);
  if (!validation.success) {
    const aiError: AIError = {
      success: false,
      error: 'Evaluation failed',
      status: 400,
      name: 'EvaluationError',
    };
    return aiError;
  }
  const evaluation = validation.data as AIEvaluation;

  return {
    success: true,
    interactionId: id,
    evaluation,
  };
}
