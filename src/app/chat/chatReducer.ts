export type ChatState =
  | { status: 'idle' }
  | { status: 'initializing' }
  | { status: 'aiTurnSpeaking' }
  | { status: 'readyForUserStart' }
  | { status: 'readyForUserReply' }
  | { status: 'listening' }
  | { status: 'listeningTimedOut' }
  | { status: 'waitingForAI' }
  | { status: 'sending' }
  | { status: 'ended' }
  | { status: 'error'; message: string };

export type ChatAction =
  | { type: 'START_CHAT' }
  | { type: 'STOP_CHAT' }
  | { type: 'AI_CHAT_CREATED'; payload: { firstTurn: 'ai' | 'user' } }
  | { type: 'START_LISTENING' }
  | { type: 'LISTENING_TIMED_OUT' }
  | { type: 'USER_REPLY_SENT' }
  | { type: 'ERROR'; payload: { message: string } };

// initial state should be { status: 'idle' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (state.status) {
    case 'idle':
      switch (action.type) {
        case 'START_CHAT':
          return {
            status: 'initializing',
          };
        case 'STOP_CHAT': {
          return {
            status: 'idle',
          };
        }
        default:
          return state;
      }
    case 'initializing':
      switch (action.type) {
        case 'AI_CHAT_CREATED':
          if (action.payload.firstTurn === 'ai') {
            return {
              status: 'readyForUserReply',
            };
          }
          return {
            status: 'readyForUserStart',
          };
        case 'ERROR':
          return {
            status: 'error',
            message: action.payload.message,
          };
        default:
          return state;
      }
    case 'waitingForAI': {
      // TODO
      return state;
    }
    case 'aiTurnSpeaking':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'readyForUserStart':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'readyForUserReply':
      switch (action.type) {
        // TODO
        case 'USER_REPLY_SENT':
          return {
            status: 'waitingForAI',
          };
        default:
          return state;
      }
    case 'listening':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'listeningTimedOut':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'sending':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'ended':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    case 'error':
      switch (action.type) {
        // TODO
        default:
          return state;
      }
    default: {
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}

// derived state functions

export function canStartChat(state: ChatState): boolean {
  return state.status === 'idle';
}

export function canStartFirstTurn(state: ChatState): boolean {
  return state.status === 'readyForUserStart';
}

export function canReply(state: ChatState): boolean {
  return state.status === 'readyForUserReply';
}
