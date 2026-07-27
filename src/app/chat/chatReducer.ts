export type ThreadItem = {
  message: string;
  author: 'ai' | 'user';
};

export type ChatState = {
  threadItems: ThreadItem[];
  phase: ChatPhase;
};

export type ChatPhase =
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
  | { type: 'USER_MESSAGE_SENT'; payload: { message: string } }
  | { type: 'ERROR'; payload: { message: string } };

// initial state should be { status: 'idle' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (state.phase.status) {
    case 'idle':
      switch (action.type) {
        case 'AI_START_INPUT_SENT':
          return {
            threadItems: state.threadItems,
            phase: { status: 'waitingForAI' },
          };
        case 'START_CHAT_WITH_USER':
          return {
            threadItems: state.threadItems,
            phase: { status: 'readyForUserStart' },
          };
        default:
          return state;
      }
    case 'waitingForAI': {
      switch (action.type) {
        case 'AI_RESPONSE_RECEIVED':
          const newItem: ThreadItem = {
            message: action.payload.message,
            author: 'ai',
          };
          return {
            threadItems: [...state.threadItems, newItem],
            phase: { status: 'aiTurnSpeaking', message: action.payload.message },
          };
        case 'ERROR':
          return {
            threadItems: state.threadItems,
            phase: { status: 'error', message: action.payload.message },
          };
        default:
          return state;
      }
    }
    case 'aiTurnSpeaking':
      switch (action.type) {
        case 'AI_FINISHED_SPEAKING':
          return {
            threadItems: state.threadItems,
            phase: { status: 'readyForUserReply' },
          };
        default:
          return state;
      }
    case 'readyForUserStart':
      switch (action.type) {
        case 'START_LISTENING':
          return {
            threadItems: state.threadItems,
            phase: { status: 'listening' },
          };
        default:
          return state;
      }
    case 'readyForUserReply':
      switch (action.type) {
        case 'START_LISTENING':
          return {
            threadItems: state.threadItems,
            phase: { status: 'listening' },
          };
        default:
          return state;
      }
    case 'listening':
      switch (action.type) {
        case 'USER_MESSAGE_SENT':
          const newItem: ThreadItem = {
            message: action.payload.message,
            author: 'user',
          };
          return {
            threadItems: [...state.threadItems, newItem],
            phase: { status: 'waitingForAI' },
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
      const exhaustiveCheck: never = state.phase;
      return exhaustiveCheck;
    }
  }
}

// derived state functions

export function canStartChat(phase: ChatPhase): boolean {
  return phase.status === 'idle';
}

export function canStartWithUser(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserStart';
}

export function canStartReply(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserReply';
}

export function canSendReply(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}
