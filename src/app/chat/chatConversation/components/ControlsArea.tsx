import {
  canStartWithUser,
  canStartReply,
  canRequestSend,
  canStopChat,
  chatHasStopped,
  canRequestEvaluation,
  evaluationIsShown,
  shouldShowEndSessionSecondaryButton,
  shouldShowCancelButton,
  canRequestCancel,
  isAITurnSpeaking,
  isWaitingForAI,
  hasError,
  type ChatPhase,
} from '@/app/chat/chatConversation/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type ControlsAreaProps = {
  phase: ChatPhase;
  onStartListening: () => void;
  // onSendUserMessage: () => void;
  onStopChat: () => void;
  onSendRequested: () => void;
  onEvaluationRequested: () => void;
  onEndSessionRequested: () => void;
  onCancelListening: () => void;
};

type PrimaryButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'feedback';
};

export default function ControlsArea({
  phase,
  onStartListening,
  onSendRequested,
  onCancelListening,
  onStopChat,
  onEvaluationRequested,
  onEndSessionRequested,
}: ControlsAreaProps) {
  const primaryButtonProps = getPrimaryButtonProps(phase);

  return (
    <div className={styles.controlsArea}>
      <div className={styles.actions}>
        <Button
          variant={primaryButtonProps.variant}
          onClick={primaryButtonProps.onClick}
          disabled={primaryButtonProps.disabled}
        >
          {primaryButtonProps.label}
        </Button>
        {canStopChat(phase) && (
          <Button variant="secondary" onClick={onStopChat}>
            Stop chat
          </Button>
        )}
        {canRequestEvaluation(phase) && (
          <Button variant="secondary" onClick={onEvaluationRequested}>
            Evaluate chat
          </Button>
        )}
        {shouldShowEndSessionSecondaryButton(phase) && (
          <Button variant="secondary" onClick={onEndSessionRequested}>
            End session
          </Button>
        )}
        {shouldShowCancelButton(phase) && (
          <Button
            variant="secondary"
            onClick={onCancelListening}
            disabled={!canRequestCancel(phase)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  function getPrimaryButtonProps(phase: ChatPhase): PrimaryButtonProps {
    if (canStartWithUser(phase)) {
      return {
        variant: 'primary',
        label: 'Start speaking',
        onClick: onStartListening,
      };
    }
    if (canStartReply(phase)) {
      return {
        variant: 'primary',
        label: 'Reply',
        onClick: onStartListening,
      };
    }
    if (canRequestSend(phase)) {
      return {
        variant: 'primary',
        label: 'Send',
        onClick: onSendRequested,
      };
    }
    if (canRequestSend(phase)) {
      return {
        variant: 'primary',
        label: 'Send',
        onClick: onSendRequested,
      };
    }
    if (isWaitingForAI(phase)) {
      return {
        variant: 'feedback',
        label: 'AI is thinking...',
        onClick: () => {},
        disabled: true,
      };
    }
    if (isAITurnSpeaking(phase)) {
      return {
        variant: 'primary',
        label: 'Reply',
        onClick: () => {},
        disabled: true,
      };
    }
    if (chatHasStopped(phase)) {
      return {
        variant: 'primary',
        label: 'End this session',
        onClick: onEndSessionRequested,
      };
    }
    if (evaluationIsShown(phase)) {
      return {
        variant: 'primary',
        label: 'End this session',
        onClick: onEndSessionRequested,
      };
    }
    if (hasError(phase)) {
      return {
        variant: 'primary',
        label: 'End this session',
        onClick: onEndSessionRequested,
      };
    }
    return {
      variant: 'feedback',
      label: 'Waiting...',
      onClick: () => {},
      disabled: true,
    };
  }
}
