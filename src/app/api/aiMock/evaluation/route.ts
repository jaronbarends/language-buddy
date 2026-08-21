/* mocked route for ai to prevent spending unnecessary tokens during development and for forcing errors */
import { NextRequest, NextResponse } from 'next/server';

import { respondAfterDelay } from '@/app/api/aiMock/respondAfterDelay';
import { AIEvaluationRequestBodySchema, getBodyValidationError } from '@/lib/aiRequest';
import { AIEvaluation } from '@/lib/aiResponse';

const MOCK_SCENARIOS = {
  success: 'success',
  successLongDelay: 'successLongDelay',
  rateLimitError: 'rateLimitError',
  notFoundError: 'notFoundError', // e.g. wrong ai model
} as const;

type MockScenario = (typeof MOCK_SCENARIOS)[keyof typeof MOCK_SCENARIOS];

// const scenario: MockScenario = 'success';
const scenario: MockScenario = 'successLongDelay';
// const scenario: MockScenario = 'rateLimitError';
// const scenario: MockScenario = 'notFoundError';

const successResponseOutputText = getMockEvaluationText();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const validation = AIEvaluationRequestBodySchema.safeParse(body);
  if (!validation.success) {
    const error = getBodyValidationError();
    return NextResponse.json({ error }, { status: 400 });
  }

  const { input } = validation.data;

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

function getMockEvaluationText(): string {
  const mockEvaluation: AIEvaluation = {
    comments: [
      {
        segments: [
          { type: 'text', text: 'where you said' },
          { type: 'userInput', text: 'zup zap' },
          { type: 'text', text: 'you probably meant' },
          { type: 'suggestion', text: 'ziiip' },
          {
            type: 'text',
            text: 'that is what native people would say when they discuss zops. Furthermore are you doing really, really fine.',
          },
        ],
      },
      {
        segments: [
          { type: 'text', text: 'where you said' },
          { type: 'userInput', text: 'zup zap' },
          { type: 'text', text: 'you probably meant' },
          { type: 'suggestion', text: 'ziiip' },
          {
            type: 'text',
            text: 'that is what native people would say when they discuss zops. Furthermore are you doing really, really fine.',
          },
        ],
      },
      {
        segments: [
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
          },
        ],
      },
      {
        segments: [
          {
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
          },
        ],
      },
    ],
  };

  return JSON.stringify(mockEvaluation);
}
