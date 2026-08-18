import type { AIEvaluation } from '@/lib/aiResponse';
import { type AIError } from '@/lib/aiService';

export type ThreadItem = ChatMessageItem | EvaluationItem;

export type ChatMessageItem = {
  type: 'message';
  message: string;
  author: 'ai' | 'user';
  isPending?: boolean;
};

export type EvaluationItem = {
  type: 'evaluation';
  evaluation: AIEvaluation;
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
  | { status: 'requestEvaluation' }
  | { status: 'waitingForEvaluation' }
  | { status: 'evaluation' }
  | { status: 'sessionEndRequested' }
  | { status: 'error'; error: AIError };

export type ChatStage = 'aiTurnFlow' | 'userTurnFlow' | 'evaluation' | 'error' | 'sessionEnded';

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
  | { type: 'REQUEST_EVALUATION' }
  | { type: 'EVALUATION_REQUEST_SENT' }
  | { type: 'EVALUATION_RECEIVED'; payload: { evaluation: AIEvaluation } }
  | { type: 'END_SESSION' }
  | { type: 'ERROR'; payload: { error: AIError } };

const loadingAIItem: ThreadItem = {
  type: 'message',
  message: '',
  author: 'ai',
  isPending: true,
};
Object.freeze(loadingAIItem); // prevent unwanted changing of props; should always be destructured

// initial state should be { status: 'chatStartPending' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === 'ERROR') {
    return {
      threadItems: removePendingAIItems(state.threadItems),
      phase: { status: 'error', error: action.payload.error },
    };
  }

  if (
    action.type === 'REQUEST_EVALUATION' &&
    canRequestEvaluation(state.phase, state.threadItems.length)
  ) {
    return {
      threadItems: state.threadItems,
      phase: { status: 'requestEvaluation' },
    };
  }

  if (action.type === 'END_SESSION') {
    return {
      threadItems: removePendingAIItems(state.threadItems),
      phase: { status: 'sessionEndRequested' },
    };
  }

  switch (state.phase.status) {
    case 'chatStartPending':
      switch (action.type) {
        case 'AI_START_INPUT_SENT':
          return {
            threadItems: [...state.threadItems, loadingAIItem],
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
        case 'AI_RESPONSE_RECEIVED': {
          // turn update pending item
          const updatedItems = state.threadItems.map((item) =>
            item.type === 'message' && item.isPending ?
              { ...item, message: action.payload.message, isPending: false }
            : item
          );
          return {
            threadItems: updatedItems,
            phase: { status: 'aiTurnSpeaking', message: action.payload.message },
          };
        }
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
          // to be used for edit
          return state;
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
            type: 'message',
            message: action.payload.message,
            author: 'user',
          };
          return {
            threadItems: [...state.threadItems, newItem, loadingAIItem],
            phase: { status: 'waitingForAI' },
          };
        }
        default:
          return state;
      }
    case 'requestEvaluation':
      switch (action.type) {
        case 'EVALUATION_REQUEST_SENT':
          return {
            threadItems: state.threadItems,
            phase: { status: 'waitingForEvaluation' },
          };
        default:
          return state;
      }
    case 'waitingForEvaluation':
      switch (action.type) {
        case 'EVALUATION_RECEIVED': {
          const newItem: EvaluationItem = {
            type: 'evaluation',
            evaluation: action.payload.evaluation,
          };
          return {
            threadItems: [...state.threadItems, newItem],
            phase: { status: 'evaluation' },
          };
        }
        default:
          return state;
      }
    case 'evaluation':
      return state;
    case 'sessionEndRequested':
      // regular cases are handled before the main switch
      // if we come here, nothing needs to happen
      return state;
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

// derived state functions: simple status translations

export function chatStartIsPending(phase: ChatPhase): boolean {
  return phase.status === 'chatStartPending';
}

export function isReadyForUserStart(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserStart';
}

export function isWaitingForAI(phase: ChatPhase): boolean {
  return phase.status === 'waitingForAI';
}

export function isAITurnSpeaking(phase: ChatPhase): boolean {
  return phase.status === 'aiTurnSpeaking';
}

export function canSpeak(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserReply' || phase.status === 'readyForUserStart';
}

export function isListening(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

export function canRequestSend(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

export function listeningShouldBeStopped(phase: ChatPhase): boolean {
  return phase.status === 'stoppingListening';
}

export function listeningShouldBeCancelled(phase: ChatPhase): boolean {
  return phase.status === 'cancellingListening';
}

export function shouldSendReply(
  // reply is actually ready to be sent
  phase: ChatPhase
): phase is Extract<ChatPhase, { status: 'sendingUserReply' }> {
  return phase.status === 'sendingUserReply';
}

export function shouldRequestEvaluation(phase: ChatPhase): boolean {
  return phase.status === 'requestEvaluation';
}

export function hasError(phase: ChatPhase): phase is Extract<ChatPhase, { status: 'error' }> {
  return phase.status === 'error';
}

export function sessionShouldEnd(phase: ChatPhase): boolean {
  return phase.status === 'sessionEndRequested';
}

// derived state functions: permissions

export function canRequestEvaluation(phase: ChatPhase, messageCount: number): boolean {
  // WARNING: don't include 'waitingForAI' here. See comment in requestsShouldBeAborted

  // 2 possible scenarios; for both we need at least 2 items:
  // 1. ai starts, then user's message is item #2
  // 2. user starts; user's message is item #1. For evaluation, we need previousInteractionId. We only have that when AI's reply comes back from server; then AI's message is item #2
  const chatContainsUserMessage = messageCount > 1;
  return (
    (phase.status === 'aiTurnSpeaking' || phase.status === 'readyForUserReply') &&
    chatContainsUserMessage
  );
}

export function canRequestCancel(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

// derived state functions: behavior

export function requestsShouldBeAborted(phase: ChatPhase): boolean {
  return (
    // WARNING: don't include 'requestEvaluation' here in order to abort waitingForAI. That request (that sends the user's last message) needs to complete in order for the previousInteractionId to be updated. Without that, the evaluation will not include the last message.
    phase.status === 'sessionEndRequested'
  );
}

// derived state functions: thread view ui

export function shouldShowRecognitionPreview(phase: ChatPhase): boolean {
  const allowedStatuses = ['listening', 'stoppingListening', 'sendingUserReply'];
  return allowedStatuses.includes(phase.status);
}

export function shouldAutoScrollThread(phase: ChatPhase): boolean {
  return (
    phase.status === 'aiTurnSpeaking' ||
    phase.status === 'waitingForAI' ||
    phase.status === 'evaluation'
  );
}

// derived state functions: stages

export function userIsInInputFlow(phase: ChatPhase): boolean {
  return getChatStage(phase) === 'userTurnFlow';
}

export function getChatStage(phase: ChatPhase): ChatStage {
  switch (phase.status) {
    case 'chatStartPending':
    case 'waitingForAI':
    case 'aiTurnSpeaking':
    case 'readyForUserReply':
    case 'readyForUserStart':
    case 'requestEvaluation':
    case 'waitingForEvaluation':
      return 'aiTurnFlow';
    case 'listening':
    case 'stoppingListening':
    case 'cancellingListening':
    case 'sendingUserReply':
      return 'userTurnFlow';
    case 'evaluation':
      return 'evaluation';
    case 'error':
      return 'error';
    case 'sessionEndRequested':
      return 'sessionEnded';
    default: {
      const exhaustiveCheck: never = phase;
      return exhaustiveCheck;
    }
  }
}

function removePendingAIItems(threadItems: ThreadItem[]): ThreadItem[] {
  return threadItems.filter((item) => item.type !== 'message' || !item.isPending);
}
