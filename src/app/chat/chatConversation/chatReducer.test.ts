import { describe, it, expect } from 'vitest';

import type { AIError } from '@/lib/aiService';

import { chatReducer, loadingAIItem } from './chatReducer';
import type { ChatState, ChatAction, ChatPhase, ChatMessageItem, StopIntent } from './chatReducer';

describe('chatReducer', () => {
  const mockAIMessage = 'ai message';
  function createMockAIItem(): ChatMessageItem {
    return {
      type: 'message',
      message: mockAIMessage,
      author: 'ai',
      isPending: false,
    };
  }

  const mockUserMessage = 'user message';
  function createMockUserItem(): ChatMessageItem {
    return {
      type: 'message',
      message: mockUserMessage,
      author: 'user',
    };
  }

  it('returns correct phases for ai starting happy path', () => {
    // action AI_START_INPUT_SENT
    const initialState: ChatState = {
      threadItems: [],
      phase: { status: 'chatStartPending' },
    };
    const action1: ChatAction = { type: 'AI_START_INPUT_SENT' };
    const expectedState1: ChatState = {
      threadItems: [loadingAIItem],
      phase: { status: 'waitingForAI' },
    };

    const state1: ChatState = chatReducer(initialState, action1);
    expect(state1).toEqual(expectedState1);

    // action AI_RESPONSE_RECEIVED
    const action2: ChatAction = {
      type: 'AI_RESPONSE_RECEIVED',
      payload: { message: mockAIMessage },
    };
    const expectedState2: ChatState = {
      threadItems: [createMockAIItem()],
      phase: { status: 'aiTurnSpeaking', message: mockAIMessage },
    };

    const state2: ChatState = chatReducer(state1, action2);
    expect(state2).toEqual(expectedState2);

    // action AI_FINISHED_SPEAKING
    const action3: ChatAction = { type: 'AI_FINISHED_SPEAKING' };
    const expectedState3: ChatState = {
      threadItems: state2.threadItems,
      phase: { status: 'readyForUserReply' },
    };
    const state3: ChatState = chatReducer(state2, action3);
    expect(state3).toEqual(expectedState3);
  });

  it('returns correct phases for user starting happy path', () => {
    // action START_LISTENING
    const initialState: ChatState = {
      threadItems: [],
      phase: { status: 'readyForUserStart' },
    };
    const action1: ChatAction = { type: 'START_LISTENING' };
    const expectedState1: ChatState = {
      threadItems: [],
      phase: { status: 'listening' },
    };

    const state1: ChatState = chatReducer(initialState, action1);
    expect(state1).toEqual(expectedState1);

    // action STOP_LISTENING
    const stopIntent: StopIntent = 'send';
    const action2: ChatAction = { type: 'STOP_LISTENING', payload: { intent: stopIntent } };
    const expectedState2: ChatState = {
      threadItems: state1.threadItems,
      phase: { status: 'stoppingListening', intent: stopIntent },
    };

    const state2: ChatState = chatReducer(state1, action2);
    expect(state2).toEqual(expectedState2);

    // action TRANSCRIPT_CREATED
    const action3: ChatAction = {
      type: 'TRANSCRIPT_CREATED',
      payload: { userMessage: mockUserMessage },
    };
    const expectedState3: ChatState = {
      threadItems: state2.threadItems,
      phase: {
        status: 'sendingUserReply',
        userMessage: mockUserMessage,
      },
    };

    const state3: ChatState = chatReducer(state2, action3);
    expect(state3).toEqual(expectedState3);

    // action USER_MESSAGE_SENT
    const action4: ChatAction = {
      type: 'USER_MESSAGE_SENT',
      payload: { message: mockUserMessage },
    };
    const expectedState4: ChatState = {
      threadItems: [createMockUserItem(), loadingAIItem],
      phase: { status: 'waitingForAI' },
    };

    const state4: ChatState = chatReducer(state3, action4);
    expect(state4).toEqual(expectedState4);
  });

  it("does not change state when dispatching an action in a phase.status that doesn't allow it", () => {
    // test only USER_MESSAGE_SENT in 'waitingForAI' to prove the fall-through mechanism works
    const initialState: ChatState = {
      threadItems: [createMockAIItem()],
      phase: { status: 'waitingForAI' },
    };
    const action: ChatAction = {
      type: 'USER_MESSAGE_SENT',
      payload: { message: mockUserMessage },
    };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toBe(initialState);
  });

  it.each([
    { intent: 'send', expectedStatus: 'sendingUserReply' },
    { intent: 'edit', expectedStatus: 'editingUserReply' },
  ] as const)(
    'returns $expectedStatus when TRANSCRIPT_CREATED with intent $intent',
    ({ intent, expectedStatus }) => {
      const initialState: ChatState = {
        threadItems: [createMockAIItem()],
        phase: { status: 'stoppingListening', intent },
      };
      const action: ChatAction = {
        type: 'TRANSCRIPT_CREATED',
        payload: { userMessage: mockUserMessage },
      };
      const expectedState: ChatState = {
        threadItems: initialState.threadItems,
        phase: { status: expectedStatus, userMessage: mockUserMessage },
      };

      const state: ChatState = chatReducer(initialState, action);
      expect(state).toEqual(expectedState);
    }
  );

  it.each([
    { intent: 'send', expectedPhase: { status: 'readyForUserReply' } },
    { intent: 'edit', expectedPhase: { status: 'editingUserReply', userMessage: '' } },
  ] as const)(
    'returns correct status $expectedPhase.status when TRANSCRIPT_EMPTY is dispatched with intent $intent',
    ({ intent, expectedPhase }) => {
      const initialState: ChatState = {
        threadItems: [createMockAIItem()],
        phase: { status: 'stoppingListening', intent },
      };
      const action: ChatAction = { type: 'TRANSCRIPT_EMPTY' };
      const expectedState: ChatState = {
        threadItems: initialState.threadItems,
        phase: expectedPhase,
      };

      const state: ChatState = chatReducer(initialState, action);
      expect(state).toEqual(expectedState);
    }
  );

  it('returns correct state when EDIT_CANCELLED is dispatched with valid userMessage', () => {
    const initialPhase: ChatPhase = { status: 'editingUserReply', userMessage: mockUserMessage };
    const initialState: ChatState = {
      threadItems: [createMockAIItem()],
      phase: initialPhase,
    };
    const action: ChatAction = { type: 'EDIT_CANCELLED' };
    const expectedState: ChatState = {
      threadItems: initialState.threadItems,
      phase: { status: 'editingCancelled', userMessage: initialPhase.userMessage },
    };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toEqual(expectedState);
  });

  it('returns correct state when EDIT_CANCELLED is dispatched with empty userMessage', () => {
    const initialPhase: ChatPhase = { status: 'editingUserReply', userMessage: '' };
    const initialState: ChatState = {
      threadItems: [createMockAIItem()],
      phase: initialPhase,
    };
    const action: ChatAction = { type: 'EDIT_CANCELLED' };
    const expectedState: ChatState = {
      threadItems: initialState.threadItems,
      phase: { status: 'readyForUserReply' },
    };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toEqual(expectedState);
  });

  it.each<ChatPhase>([
    { status: 'readyForUserReply' },
    { status: 'aiTurnSpeaking', message: 'ai message' },
  ])(
    'requests evaluation when in phase $status and when chat contains a user and ai message',
    (phase) => {
      const initialState: ChatState = {
        threadItems: [createMockUserItem(), createMockAIItem()],
        phase: phase,
      };
      const action: ChatAction = { type: 'REQUEST_EVALUATION' };
      const expectedState: ChatState = {
        threadItems: initialState.threadItems,
        phase: { status: 'requestEvaluation' },
      };

      const state: ChatState = chatReducer(initialState, action);
      expect(state).toEqual(expectedState);
    }
  );

  it('does not request evaluation when in wrong phase', () => {
    const initialState: ChatState = {
      threadItems: [createMockUserItem(), createMockAIItem()],
      phase: { status: 'waitingForAI' },
    };
    const action: ChatAction = { type: 'REQUEST_EVALUATION' };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toBe(initialState);
  });

  it('does not request evaluation when there is only one threadItem', () => {
    const initialState: ChatState = {
      threadItems: [createMockAIItem()],
      phase: { status: 'readyForUserReply' },
    };
    const action: ChatAction = { type: 'REQUEST_EVALUATION' };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toBe(initialState);
  });

  it('removes pending ai items and correct status when END_SESSION is dispatched', () => {
    const initialState: ChatState = {
      threadItems: [createMockUserItem(), loadingAIItem],
      phase: { status: 'waitingForAI' },
    };
    const action: ChatAction = { type: 'END_SESSION' };
    const expectedState: ChatState = {
      threadItems: [createMockUserItem()],
      phase: { status: 'sessionEndRequested' },
    };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toEqual(expectedState);
  });

  it('removes pending ai items and correct status when ERROR is dispatched', () => {
    const initialState: ChatState = {
      threadItems: [createMockUserItem(), loadingAIItem],
      phase: { status: 'waitingForAI' },
    };
    const error: AIError = {
      success: false,
      error: 'oops',
      status: 400,
      name: 'someError',
    };
    const action: ChatAction = {
      type: 'ERROR',
      payload: { error },
    };
    const expectedState: ChatState = {
      threadItems: [createMockUserItem()],
      phase: { status: 'error', error },
    };

    const state: ChatState = chatReducer(initialState, action);
    expect(state).toEqual(expectedState);
  });
});
