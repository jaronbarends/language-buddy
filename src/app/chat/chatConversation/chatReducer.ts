import { type AIError } from '@/lib/aiService';

export type ThreadItem = ChatMessageItem | EvaluationItem;

export type ChatMessageItem = {
  type: 'message';
  message: string;
  author: 'ai' | 'user';
};

export type EvaluationItem = {
  type: 'evaluation';
  message: string;
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
  | { status: 'chatStopped' }
  | { status: 'requestEvaluation' }
  | { status: 'waitingForEvaluation' }
  | { status: 'evaluation' }
  | { status: 'sessionEndRequested' }
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
  | { type: 'STOP_CHAT' }
  | { type: 'REQUEST_EVALUATION' }
  | { type: 'EVALUATION_REQUEST_SENT' }
  | { type: 'EVALUATION_RECEIVED'; payload: { evaluation: string } }
  | { type: 'END_SESSION' }
  | { type: 'ERROR'; payload: { error: AIError } };

// initial state should be { status: 'chatStartPending' }
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === 'ERROR') {
    return {
      threadItems: state.threadItems,
      phase: { status: 'error', error: action.payload.error },
    };
  }

  if (action.type === 'STOP_CHAT' && canStopChat(state.phase)) {
    return {
      threadItems: state.threadItems,
      phase: { status: 'chatStopped' },
    };
  }

  if (action.type === 'REQUEST_EVALUATION' && canRequestEvaluation(state.phase)) {
    return {
      threadItems: state.threadItems,
      phase: { status: 'requestEvaluation' },
    };
  }

  if (action.type === 'END_SESSION' && canEndSession(state.phase)) {
    return {
      threadItems: state.threadItems,
      phase: { status: 'sessionEndRequested' },
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
        case 'AI_RESPONSE_RECEIVED': {
          const newItem: ThreadItem = {
            type: 'message',
            message: action.payload.message,
            author: 'ai',
          };
          return {
            threadItems: [...state.threadItems, newItem],
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
            threadItems: [...state.threadItems, newItem],
            phase: { status: 'waitingForAI' },
          };
        }
        default:
          return state;
      }
    case 'chatStopped':
      // regular cases are handled before the main switch
      // if we come here, nothing needs to happen
      return state;
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
            message: action.payload.evaluation,
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

export function canStartWithUser(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserStart';
}

export function isWaitingForAI(phase: ChatPhase): boolean {
  return phase.status === 'waitingForAI';
}

export function isAITurnSpeaking(phase: ChatPhase): boolean {
  return phase.status === 'aiTurnSpeaking';
}

export function canStartReply(phase: ChatPhase): boolean {
  return phase.status === 'readyForUserReply';
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

export function chatHasStopped(phase: ChatPhase): boolean {
  return phase.status === 'chatStopped';
}

export function shouldRequestEvaluation(phase: ChatPhase): boolean {
  return phase.status === 'requestEvaluation';
}

export function evaluationIsShown(phase: ChatPhase): boolean {
  return phase.status === 'evaluation';
}

export function hasError(phase: ChatPhase): phase is Extract<ChatPhase, { status: 'error' }> {
  return phase.status === 'error';
}

export function canEndSession(phase: ChatPhase): boolean {
  return (
    phase.status === 'chatStopped' || phase.status === 'evaluation' || phase.status === 'error'
  );
}

export function sessionShouldEnd(phase: ChatPhase): boolean {
  return phase.status === 'sessionEndRequested';
}

// derived state functions: grouped statuses

export function userIsInInputFlow(phase: ChatPhase): boolean {
  const inputFlowStatuses = [
    'listening',
    'stoppingListening',
    'cancellingListening',
    'sendingUserReply',
  ];
  return inputFlowStatuses.includes(phase.status);
}

function isAITurn(phase: ChatPhase): boolean {
  return phase.status === 'waitingForAI' || phase.status === 'aiTurnSpeaking';
}

function isInEvaluationFlow(phase: ChatPhase): boolean {
  const evaluationFlowStatuses = ['requestEvaluation', 'waitingForEvaluation', 'evaluation'];
  return evaluationFlowStatuses.includes(phase.status);
}

// derived state functions: permissions

export function canRequestEvaluation(phase: ChatPhase): boolean {
  return (
    phase.status === 'aiTurnSpeaking' ||
    phase.status === 'readyForUserReply' ||
    phase.status === 'chatStopped'
  );
}

export function canStopChat(phase: ChatPhase): boolean {
  return (
    phase.status !== 'chatStopped' &&
    phase.status !== 'chatStartPending' &&
    !userIsInInputFlow(phase) &&
    !isInEvaluationFlow(phase) &&
    phase.status !== 'sessionEndRequested' &&
    !hasError(phase)
  );
}

export function canRequestCancel(phase: ChatPhase): boolean {
  return phase.status === 'listening';
}

// derived state functions: behavior

export function requestsShouldBeAborted(phase: ChatPhase): boolean {
  return (
    phase.status === 'chatStopped' ||
    // phase.status === 'requestEvaluation' ||
    phase.status === 'sessionEndRequested'
  );
}

// derived state functions: controls ui

export function shouldShowEvaluationSecondaryButton(phase: ChatPhase): boolean {
  return (
    isAITurn(phase) ||
    phase.status === 'readyForUserReply' ||
    phase.status === 'requestEvaluation' ||
    phase.status === 'waitingForEvaluation'
    // !isInEvaluationFlow(phase) &&
    // userIsInInputFlow(phase) &&
    // phase.status !== 'chatStartPending' &&
    // phase.status !== 'sessionEndRequested' &&
    // !hasError(phase)
  );
}

export function shouldShowCancelButton(phase: ChatPhase): boolean {
  return userIsInInputFlow(phase);
}

export function shouldShowEndSessionSecondaryButton(phase: ChatPhase) {
  // if phase is error, we could technically stop the chat, but then we still need to end the session. So we'll just set primary button to End session.
  return chatHasStopped(phase) && !hasError(phase);
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
