import {
  canStartWithUser,
  canStartReply,
  canRequestSend,
  canStopSession,
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
  onSendUserMessage: () => void;
  onEndSession: () => void;
  onSendRequested: () => void;
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
  onEndSession,
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
        {shouldShowStopButton(phase) && (
          <Button variant="secondary" onClick={onEndSession}>
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

  function shouldShowStopButton(phase: ChatPhase) {
    // if phase is error, we could technically stop the chat, but then we still need to end the session. So we'll just set primary button to End session.
    return canStopSession(phase) && !hasError(phase);
  }

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
    if (hasError(phase)) {
      return {
        variant: 'primary',
        label: 'End this session',
        onClick: onEndSession,
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
