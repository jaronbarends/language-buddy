import { type ChatState } from '@/app/conversation/chatReducer';
import { canStartChat, canStartFirstTurn, canReply } from '@/app/conversation/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type PropsType = {
  state: ChatState;
  onStartChat: () => void;
  onStopChat: () => void;
  onStartListening: () => void;
};

export default function ControlsArea({
  state,
  onStartChat,
  onStopChat,
  onStartListening,
}: PropsType) {
  return (
    <div className={styles.component}>
      {canStartChat(state) && (
        <Button variant="primary" onClick={onStartChat}>
          Start conversation
        </Button>
      )}
      <Button variant="primary" onClick={onStartListening}>
        Start speaking
      </Button>
      <Button variant="primary" onClick={onStartListening}>
        Reply
      </Button>
      <Button variant="ghost" onClick={onStopChat}>
        End conversation
      </Button>
    </div>
  );
}
