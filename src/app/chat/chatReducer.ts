export type ChatState =
  | { status: 'idle' }
  | { status: 'waitingForAI' }
  | { status: 'aiTurnSpeaking'; message: string }
  | { status: 'readyForUserStart' }
  | { status: 'readyForUserReply' }
  | { status: 'listening' }
  | { status: 'listeningTimedOut' }
  | { status: 'ended' }
  | { status: 'error'; message: string };

export type ChatAction =
  | { type: 'AI_START_INPUT_SENT' }
  | { type: 'START_CHAT_WITH_USER' }
  | { type: 'AI_RESPONSE_RECEIVED'; payload: { message: string } }
  | { type: 'AI_FINISHED_SPEAKING' }
  | { type: 'STOP_CHAT' }
  | { type: 'START_LISTENING' }
  | { type: 'LISTENING_TIMED_OUT' }
  | { type: 'USER_MESSAGE_SENT' }
  | { type: 'ERROR'; payload: { message: string } };

// initial state should be { status: 'idle' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (state.status) {
    case 'idle':
      switch (action.type) {
        case 'AI_START_INPUT_SENT':
          return {
            status: 'waitingForAI',
          };
        case 'START_CHAT_WITH_USER':
          return {
            status: 'readyForUserStart',
          };
        default:
          return state;
      }
    case 'waitingForAI': {
      switch (action.type) {
        case 'AI_RESPONSE_RECEIVED':
          return {
            status: 'aiTurnSpeaking',
            message: action.payload.message,
          };
        case 'ERROR':
          return {
            status: 'error',
            message: action.payload.message,
          };
        default:
          return state;
      }
    }
    case 'aiTurnSpeaking':
      switch (action.type) {
        case 'AI_FINISHED_SPEAKING':
          return {
            status: 'readyForUserReply',
          };
        default:
          return state;
      }
    case 'readyForUserStart':
      switch (action.type) {
        case 'START_LISTENING':
          return {
            status: 'listening',
          };
        default:
          return state;
      }
    case 'readyForUserReply':
      switch (action.type) {
        case 'START_LISTENING':
          return {
            status: 'listening',
          };
        default:
          return state;
      }
    case 'listening':
      switch (action.type) {
        case 'USER_MESSAGE_SENT':
          return {
            status: 'waitingForAI',
          };
        default:
          return state;
      }
    case 'listeningTimedOut':
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

export function canStartWithUser(state: ChatState): boolean {
  return state.status === 'readyForUserStart';
}

export function canStartReply(state: ChatState): boolean {
  return state.status === 'readyForUserReply';
}

export function canSendReply(state: ChatState): boolean {
  return state.status === 'listening';
}
