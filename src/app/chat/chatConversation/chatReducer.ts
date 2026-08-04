import { type AIError } from '@/lib/aiService';

export type ThreadItem = {
  message: string;
  author: 'ai' | 'user';
};

export type ChatState = {
  threadItems: ThreadItem[];
  phase: ChatPhase;
};

type StopIntent = 'send' | 'edit';

export type ChatPhase =
  | { status: 'chatStartPending' }
  | { status: 'waitingForAI' }
  | { status: 'aiTurnSpeaking'; message: string }
  | { status: 'readyForUserStart' }
  | { status: 'readyForUserReply' }
  | { status: 'listening' }
  | { status: 'stoppingListening'; intent: StopIntent }
  | { status: 'cancellingListening' }
  | { status: 'sendingUserReply'; transcript: string }
  | { status: 'error'; error: AIError };

export type ChatAction =
  | { type: 'AI_START_INPUT_SENT' }
  | { type: 'START_CHAT_WITH_USER' }
  | { type: 'AI_RESPONSE_RECEIVED'; payload: { message: string } }
  | { type: 'AI_FINISHED_SPEAKING' }
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING'; payload: { intent: StopIntent } }
  | { type: 'CANCEL_LISTENING' }
  | { type: 'LISTENING_CANCELLED' }
  | { type: 'TRANSCRIPT_CREATED'; payload: { transcript: string } }
  | { type: 'TRANSCRIPT_EMPTY' }
  | { type: 'USER_MESSAGE_SENT'; payload: { message: string } }
  | { type: 'ERROR'; payload: { error: AIError } };

// initial state should be { status: 'chatStartPending' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === 'ERROR') {
    return {
      threadItems: state.threadItems,
      phase: { status: 'error', error: action.payload.error },
    };
  }

  switch (state.phase.status) {
    case 'chatStartPending':
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
            phase: { status: 'stoppingListening', intent: action.payload.intent },
          };
        case 'CANCEL_LISTENING':
          return {
            threadItems: state.threadItems,
            phase: { status: 'cancellingListening' },
          };
        default:
          return state;
      }
    case 'stoppingListening':
      switch (action.type) {
        case 'TRANSCRIPT_CREATED':
          if (state.phase.intent === 'send') {
            return {
              threadItems: state.threadItems,
              phase: { status: 'sendingUserReply', transcript: action.payload.transcript },
            };
          }
        case 'TRANSCRIPT_EMPTY':
          return {
            threadItems: state.threadItems,
            phase: { status: 'readyForUserReply' },
          };
        default:
          return state;
      }
    case 'cancellingListening':
      switch (action.type) {
        case 'LISTENING_CANCELLED':
          return {
            threadItems: state.threadItems,
            phase: { status: 'readyForUserReply' },
          };
        default:
          return state;
      }
    case 'sendingUserReply':
      switch (action.type) {
        case 'USER_MESSAGE_SENT': {
          const newItem: ThreadItem = {
            message: action.payload.message,
            author: 'user',
          };
          return {
            threadItems: [...state.threadItems, newItem],
            phase: { status: 'waitingForAI' },
          };
        }
        default:
          return state;
      }
    case 'error':
      switch (action.type) {
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

export function canStartWithUser(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserStart';
}

export function canStartReply(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserReply';
}

export function canRequestSend(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

export function canSendReply(
  // reply is actually ready to be sent
  phase: ChatPhase
): phase is Extract<ChatPhase, { status: 'sendingUserReply' }> {
  return phase.status === 'sendingUserReply';
}

export function canStopSession(phase: ChatPhase): boolean {
  return !userIsInInputFlow(phase);
}

export function hasError(phase: ChatPhase): phase is Extract<ChatPhase, { status: 'error' }> {
  return phase.status === 'error';
}

export function isAITurnSpeaking(phase: ChatPhase): boolean {
  return phase.status === 'aiTurnSpeaking';
}

export function isWaitingForAI(phase: ChatPhase): boolean {
  return phase.status === 'waitingForAI';
}

export function chatStartIsPending(phase: ChatPhase): boolean {
  return phase.status === 'chatStartPending';
}

export function isListening(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

export function listeningShouldBeStopped(phase: ChatPhase): boolean {
  return phase.status === 'stoppingListening';
}

export function listeningShouldBeCancelled(phase: ChatPhase): boolean {
  return phase.status === 'cancellingListening';
}

export function shouldAutoScrollThread(phase: ChatPhase): boolean {
  return phase.status === 'aiTurnSpeaking' || phase.status === 'waitingForAI';
}

export function shouldShowRecognitionPreview(phase: ChatPhase): boolean {
  const allowedStatuses = ['listening', 'stoppingListening', 'sendingUserReply'];
  return allowedStatuses.includes(phase.status);
}

function userIsInInputFlow(phase: ChatPhase): boolean {
  const allowedStatuses = [
    'listening',
    'stoppingListening',
    'cancellingListening',
    'sendingUserReply',
  ];
  return allowedStatuses.includes(phase.status);
}

export function shouldShowCancelButton(phase: ChatPhase): boolean {
  return userIsInInputFlow(phase);
}

export function canRequestCancel(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}
