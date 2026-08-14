/* mocked route for ai to prevent spending unnecessary tokens during development and for forcing errors */
import { NextRequest, NextResponse } from 'next/server';

import { respondAfterDelay } from '@/app/api/aiMock/respondAfterDelay';
import { AIRequestBody, getBodyValidationError } from '@/lib/aiRequest';

const MOCK_SCENARIOS = {
  success: 'success',
  successLongDelay: 'successLongDelay',
  rateLimitError: 'rateLimitError',
  notFoundError: 'notFoundError', // e.g. wrong ai model
} as const;

type MockScenario = (typeof MOCK_SCENARIOS)[keyof typeof MOCK_SCENARIOS];

const scenario: MockScenario = 'success';
// const scenario: MockScenario = 'successLongDelay';
// const scenario: MockScenario = 'rateLimitError';
// const scenario: MockScenario = 'notFoundError';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = AIRequestBody.safeParse(body);
  if (!validation.success) {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const { input } = validation.data;
  const successResponseOutputText = 'Je doet het reuze goed';

  const selectedScenario = input === 'error' ? MOCK_SCENARIOS.notFoundError : scenario;

  switch (selectedScenario) {
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
    case MOCK_SCENARIOS.notFoundError:
      return respondAfterDelay({
        data: { error: 'Not found', name: 'NotFoundError' },
        status: 404,
      });
    default: {
      const exhaustiveCheck: never = selectedScenario;
      throw new Error(`Unhandled mock scenario: ${exhaustiveCheck}`);
    }
  }
}
