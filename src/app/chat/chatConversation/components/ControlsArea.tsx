import {
  isReadyForUserStart,
  canRequestEvaluation,
  canRequestCancel,
  canRequestSend,
  canSpeak,
  getChatStage,
  type ChatPhase,
  type ChatStage,
} from '@/app/chat/chatConversation/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type ControlsAreaProps = {
  phase: ChatPhase;
  messageCount: number;
  onStartListening: () => void;
  onSendRequested: () => void;
  onEvaluationRequested: () => void;
  onEndSessionRequested: () => void;
  onCancelListening: () => void;
};

type ButtonPriority = 'primary' | 'secondary' | 'tertiary';
type ButtonId = 'speak' | 'send' | 'cancel' | 'evaluate' | 'endSession';

const priorityOrder = ['primary', 'secondary', 'tertiary'] as const satisfies ButtonPriority[];
const buttonsByStage: Record<ChatStage, Partial<Record<ButtonPriority, ButtonId>>> = {
  aiTurnFlow: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' },
  userTurnFlow: { primary: 'send', secondary: 'cancel' },
  evaluation: { primary: 'endSession' },
  error: { primary: 'endSession' },
  sessionEnded: {},
};

export default function ControlsArea({
  phase,
  messageCount,
  onStartListening,
  onSendRequested,
  onCancelListening,
  onEvaluationRequested,
  onEndSessionRequested,
}: ControlsAreaProps) {
  const buttonConfig: Record<ButtonId, { label: string; onClick: () => void }> = {
    speak: { label: 'Reply', onClick: onStartListening },
    send: { label: 'Send', onClick: onSendRequested },
    cancel: { label: 'Cancel', onClick: onCancelListening },
    evaluate: { label: 'Evaluate', onClick: onEvaluationRequested },
    endSession: { label: 'End session', onClick: onEndSessionRequested },
  };
  const stage: ChatStage = getChatStage(phase);
  const stageButtons = buttonsByStage[stage];

  return (
    <div className={styles.controlsArea}>
      <div className={styles.actions}>
        {priorityOrder.map((priority) => {
          const buttonId = stageButtons[priority];
          if (!buttonId) return null;

          const { onClick } = buttonConfig[buttonId];
          const label = getLabel(buttonId);
          return (
            <Button
              key={buttonId}
              variant={priority === 'primary' ? 'primary' : 'secondary'}
              onClick={onClick}
              disabled={buttonIsDisabled(buttonId, phase, messageCount)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );

  function getLabel(buttonId: ButtonId) {
    if (isReadyForUserStart(phase) && buttonId === 'speak') {
      return 'Start conversation';
    }
    return buttonConfig[buttonId].label;
  }
}

function buttonIsDisabled(buttonId: ButtonId, phase: ChatPhase, messageCount: number): boolean {
  switch (buttonId) {
    case 'speak':
      return !canSpeak(phase);
    case 'send':
      return !canRequestSend(phase);
    case 'cancel':
      return !canRequestCancel(phase);
    case 'evaluate':
      return !canRequestEvaluation(phase, messageCount);
    default:
      return false;
  }
}
