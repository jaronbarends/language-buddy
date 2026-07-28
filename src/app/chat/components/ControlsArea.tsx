import {
  canStartChat,
  canStartWithUser,
  canStartReply,
  canSendReply,
  canStopChat,
  chatHasEnded,
  hasError,
  type ChatPhase,
} from '@/app/chat/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type PropsType = {
  phase: ChatPhase;
  onStartChat: () => void;
  onStopChat: () => void;
  onStartListening: () => void;
  onSendUserMessage: () => void;
  onEndSession: () => void;
};

type PrimaryButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export default function ControlsArea({
  phase,
  onStartChat,
  onStopChat,
  onStartListening,
  onSendUserMessage,
  onEndSession,
}: PropsType) {
  const buttonProps = getPrimaryButtonProps(phase);
  const disabled = buttonProps.disabled || false;
  return (
    <div className={styles.component}>
      <Button variant="primary" onClick={buttonProps.onClick} disabled={disabled}>
        {buttonProps.label}
      </Button>
      {shouldShowStopButton(phase) && (
        <Button variant="ghost" onClick={onStopChat}>
          End conversation
        </Button>
      )}
    </div>
  );

  function shouldShowStopButton(phase: ChatPhase) {
    // if phase is error, we could technically stop the chat, but then we still need to end the session. So we'll just set primary button to End session.
    return canStopChat(phase) && phase.status !== 'error';
  }

  function getPrimaryButtonProps(phase: ChatPhase): PrimaryButtonProps {
    if (canStartChat(phase)) {
      return {
        label: 'Start conversation',
        onClick: onStartChat,
      };
    }
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
