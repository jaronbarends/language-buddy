import {
  canStartChat,
  canStartWithUser,
  canStartReply,
  canSendReply,
  type ChatState,
} from '@/app/chat/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type PropsType = {
  state: ChatState;
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
  state,
  onStartChat,
  onStopChat,
  onStartListening,
  onSendUserMessage,
}: PropsType) {
  const buttonProps = getPrimaryButtonProps(state);
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

  function getPrimaryButtonProps(state: ChatState): PrimaryButtonProps {
    if (canStartChat(state)) {
      return {
        label: 'Start conversation',
        onClick: onStartChat,
      };
    }
    if (canStartWithUser(state)) {
      return {
        label: 'Start speaking',
        onClick: onStartListening,
      };
    }
    if (canStartReply(state)) {
      return {
        label: 'Start reply',
        onClick: onStartListening,
      };
    }
    if (canSendReply(state)) {
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
