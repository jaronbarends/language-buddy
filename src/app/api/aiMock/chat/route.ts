/* mocked route for ai to prevent spending unnecessary tokens during development and for forcing errors */
import { NextRequest, NextResponse } from 'next/server';

import { type ChatMessageParams } from '@/app/api/ai/chat/route';

const MOCK_SCENARIOS = {
  success: 'success',
  successLongDelay: 'successLongDelay',
  rateLimitError: 'rateLimitError',
  notFoundError: 'notFoundError', // e.g. wrong ai model
  aiCreationError: 'aiCreationError', // e.g. missing API key
} as const;

type MockScenario = (typeof MOCK_SCENARIOS)[keyof typeof MOCK_SCENARIOS];

let scenario: MockScenario = 'success';
// let scenario: MockScenario = 'successLongDelay';
// let scenario: MockScenario = 'rateLimitError';
// let scenario: MockScenario = 'notFoundError';
// let scenario: MockScenario = 'aiCreationError';

export async function POST(request: NextRequest) {
  const { input } = (await request.json()) as ChatMessageParams;
  const successResponseOutputText = 'Wat vind jij eigenlijk leuk om te doen?';

  if (input === 'error') {
    scenario = 'notFoundError';
  }

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
        data: { error: 'Not found', name: 'NotFoundError' },
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
  delayMs = 1000,
  status = 200,
}: {
  data: object;
  delayMs?: number;
  status?: number;
}): Promise<NextResponse> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return NextResponse.json(data, { status });
}
