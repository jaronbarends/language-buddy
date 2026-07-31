/* mocked route for ai to prevent spending unnecessary tokens during development */
import { NextRequest, NextResponse } from 'next/server';

import { type ChatMessageParams } from '../../ai/chat/route';

const MOCK_SCENARIOS = {
  success: 'success',
  successLongDelay: 'successLongDelay',
  rateLimitError: 'rateLimitError',
  notFoundError: 'notFoundError', // e.g. wrong ai model
  aiCreationError: 'aiCreationError', // e.g. missing API key
} as const;

type MockScenario = (typeof MOCK_SCENARIOS)[keyof typeof MOCK_SCENARIOS];

const scenario: MockScenario = 'success';
// const scenario: MockScenario = 'successLongDelay';
// const scenario: MockScenario = 'rateLimitError';
// const scenario: MockScenario = 'notFoundError';
// const scenario: MockScenario = 'aiCreationError';

export async function POST(request: NextRequest) {
  const { systemInstruction, previousInteractionId, input } =
    (await request.json()) as ChatMessageParams;
  // const successResponseOutputText = `mock response.output_text (response to ${input})`;
  const successResponseOutputText = `Hei! Det er så fint vær ute i dag, så jeg har tilbrakt mye tid i hagen. Har du noen spennende hobbyer du pleier å holde på med i helgene? Hei! Det er så fint vær ute i dag, så jeg har tilbrakt mye tid i hagen. Har du noen spennende hobbyer du pleier å holde på med i helgene?`;

  switch (scenario) {
    case MOCK_SCENARIOS.success:
      return respondAfterDelay({
        data: { id: 'mock response.id', text: successResponseOutputText },
      });
    case MOCK_SCENARIOS.successLongDelay:
      return respondAfterDelay({
        data: { id: 'mock response.id', text: successResponseOutputText },
        delayMs: 5000,
      });
    case MOCK_SCENARIOS.rateLimitError:
      return respondAfterDelay({
        data: { error: 'Rate limit exceeded', name: 'RateLimitError' },
        status: 429,
      });
    case MOCK_SCENARIOS.aiCreationError:
      return respondAfterDelay({
        data: { error: 'Could not create ai object', name: 'aiCreationError' },
        status: 500,
      });
    case MOCK_SCENARIOS.notFoundError:
      return respondAfterDelay({
        data: { error: 'Rate limit exceeded', name: 'NotFoundError' },
        status: 404,
      });
    default: {
      const exhaustiveCheck: never = scenario;
      throw new Error(`Unhandled mock scenario: ${exhaustiveCheck}`);
    }
  }
}

async function respondAfterDelay({
  data,
  delayMs = 300,
  status = 200,
}: {
  data: object;
  delayMs?: number;
  status?: number;
}): Promise<NextResponse> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return NextResponse.json(data, { status });
}
