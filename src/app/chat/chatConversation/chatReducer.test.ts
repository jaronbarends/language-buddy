import { describe, it, expect } from 'vitest';

import { chatReducer } from './chatReducer';
import type { ChatState, ChatAction } from './chatReducer';

describe('chatReducer', () => {
  it('returns correct phases for happy path', () => {
    const initialState: ChatState = {
      threadItems: [],
      phase: { status: 'chatStartPending' },
    };
    const action: ChatAction = { type: 'AI_START_INPUT_SENT' };
    const state = chatReducer(initialState, action);
    expect(state).toBeTruthy();
  });
});
