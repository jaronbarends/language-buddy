import { type AIChatError } from '@/lib/aiService';

export type ThreadItem = {
  message: string;
  author: 'ai' | 'user';
};

export type ChatState = {
  threadItems: ThreadItem[];
  phase: ChatPhase;
};

export type ChatPhase =
  | { status: 'readyForNewChat' }
  | { status: 'waitingForAI' }
  | { status: 'aiTurnSpeaking'; message: string }
  | { status: 'readyForUserStart' }
  | { status: 'readyForUserReply' }
  | { status: 'listening' }
  | { status: 'listeningStopped' }
  | { status: 'readyForSendingUserReply'; transcript: string }
  | { status: 'listeningTimedOut' }
  | { status: 'ended' } // ended, need to get evaluation now. rename to waitingForEvaluation? Next step readyForNewChat?
  | { status: 'error'; error: AIChatError };

export type ChatAction =
  | { type: 'AI_START_INPUT_SENT' }
  | { type: 'START_CHAT_WITH_USER' }
  | { type: 'AI_RESPONSE_RECEIVED'; payload: { message: string } }
  | { type: 'AI_FINISHED_SPEAKING' }
  | { type: 'STOP_CHAT' }
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'LISTENING_TIMED_OUT' }
  | { type: 'TRANSCRIPT_CREATED'; payload: { transcript: string } }
  | { type: 'USER_MESSAGE_SENT'; payload: { message: string } }
  | { type: 'END_SESSION' }
  | { type: 'ERROR'; payload: { error: AIChatError } };

// initial state should be { status: 'readyForNewChat' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (
    action.type === 'STOP_CHAT' &&
    state.phase.status !== 'readyForNewChat' &&
    state.phase.status !== 'ended'
  ) {
    return {
      threadItems: state.threadItems,
      phase: { status: 'ended' },
    };
  }

  if (action.type === 'ERROR') {
    return {
      threadItems: state.threadItems,
      phase: { status: 'error', error: action.payload.error },
    };
  }

  switch (state.phase.status) {
    case 'readyForNewChat':
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
        case 'STOP_LISTENING':
          return {
            threadItems: state.threadItems,
            phase: { status: 'listeningStopped' },
          };
        default:
          return state;
      }
    case 'listeningStopped':
      switch (action.type) {
        case 'TRANSCRIPT_CREATED':
          return {
            threadItems: state.threadItems,
            phase: { status: 'readyForSendingUserReply', transcript: action.payload.transcript },
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
    case 'readyForSendingUserReply':
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
    case 'ended':
      switch (action.type) {
        case 'END_SESSION':
          return {
            threadItems: [],
            phase: { status: 'readyForNewChat' },
          };
        default:
          return state;
      }
    case 'error':
      switch (action.type) {
        case 'END_SESSION':
          return {
            threadItems: [],
            phase: { status: 'readyForNewChat' },
          };
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
  return phase.status === 'readyForNewChat';
}

export function canStartWithUser(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserStart';
}

export function canStartReply(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserReply';
}

export function canStopListening(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

export function canSendReply(phase: ChatPhase): boolean {
  return phase.status === 'readyForSendingUserReply';
}

export function canStopChat(phase: ChatPhase): boolean {
  const status = phase.status;
  return status !== 'readyForNewChat' && status !== 'ended';
}

export function chatHasEnded(phase: ChatPhase): boolean {
  return phase.status === 'ended';
}

export function hasError(phase: ChatPhase): boolean {
  return phase.status === 'error';
}
