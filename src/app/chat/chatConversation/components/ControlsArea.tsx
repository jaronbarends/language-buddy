import {
  canStartWithUser,
  canStartReply,
  canStopListening,
  canSendReply,
  canStopChat,
  chatHasEnded,
  hasError,
  type ChatPhase,
} from '@/app/chat/chatConversation/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type ControlsAreaProps = {
  phase: ChatPhase;
  onStopChat: () => void;
  onStartListening: () => void;
  onSendUserMessage: () => void;
  onEndSession: () => void;
  onStopListening: () => void;
};

type PrimaryButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export default function ControlsArea({
  phase,
  onStopChat,
  onStartListening,
  onSendUserMessage,
  onStopListening,
  onEndSession,
}: ControlsAreaProps) {
  const buttonProps = getPrimaryButtonProps(phase);
  const disabled = buttonProps.disabled || false;
  return (
    <div className={styles.controlsArea}>
      <div className={styles.actions}>
        <Button variant="primary" onClick={buttonProps.onClick} disabled={disabled}>
          {buttonProps.label}
        </Button>
        {shouldShowStopButton(phase) && (
          <Button variant="ghost" onClick={onStopChat}>
            End conversation
          </Button>
        )}
      </div>
    </div>
  );

  function shouldShowStopButton(phase: ChatPhase) {
    // if phase is error, we could technically stop the chat, but then we still need to end the session. So we'll just set primary button to End session.
    return canStopChat(phase) && !hasError(phase);
  }

  function getPrimaryButtonProps(phase: ChatPhase): PrimaryButtonProps {
    if (canStartWithUser(phase)) {
      return {
        label: 'Start speaking',
        onClick: onStartListening,
      };
    }
    if (canStartReply(phase)) {
      return {
        label: 'Start reply',
        onClick: onStartListening,
      };
    }
    if (canStopListening(phase)) {
      return {
        label: 'Stop listening',
        onClick: onStopListening,
      };
    }
    if (canSendReply(phase)) {
      return {
        label: 'Send message',
        onClick: onSendUserMessage,
      };
    }
    if (chatHasEnded(phase)) {
      return {
        label: 'End this session',
        onClick: onEndSession,
      };
    }
    if (hasError(phase)) {
      return {
        label: 'End this session',
        onClick: onEndSession,
      };
    }
    return {
      label: 'Waiting...',
      onClick: () => {},
      disabled: true,
    };
  }
}
