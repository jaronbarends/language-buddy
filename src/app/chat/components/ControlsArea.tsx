import {
  canStartChat,
  canStartWithUser,
  canStartReply,
  canSendReply,
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
}: PropsType) {
  const buttonProps = getPrimaryButtonProps(phase);
  const disabled = buttonProps.disabled || false;
  return (
    <div className={styles.component}>
      <Button variant="primary" onClick={buttonProps.onClick} disabled={disabled}>
        {buttonProps.label}
      </Button>
      <Button variant="ghost" onClick={onStopChat}>
        End conversation
      </Button>
    </div>
  );

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
        label: 'Send reply',
        onClick: onSendUserMessage,
      };
    }
    return {
      label: 'Waiting...',
      onClick: () => {},
      disabled: true,
    };
  }
}
