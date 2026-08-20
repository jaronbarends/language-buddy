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
import { type IconName } from '@/lib/getIconByName';

import styles from './ControlsArea.module.css';

type ControlsAreaProps = {
  phase: ChatPhase;
  messageCount: number;
  onStartListening: () => void;
  onStopListeningToSend: () => void;
  onStopListeningToEdit: () => void;
  onEvaluationRequested: () => void;
  onEndSessionRequested: () => void;
  onCancelListening: () => void;
  onCancelEditing: () => void;
  onStopEditingToSend: () => void;
  onSendIdle: () => void;
  onEditAgain: () => void;
};

type ButtonPriority = 'primary' | 'secondary' | 'tertiary';
type ButtonId =
  | 'speak'
  | 'sendListening'
  | 'cancel'
  | 'edit'
  | 'sendEditing'
  | 'cancelEdit'
  | 'sendIdle'
  | 'editAgain'
  | 'evaluate'
  | 'endSession';

const priorityOrder = ['primary', 'secondary', 'tertiary'] as const satisfies ButtonPriority[];
const buttonsByStage: Record<ChatStage, Partial<Record<ButtonPriority, ButtonId>>> = {
  aiTurnFlow: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' },
  userTurnFlow: { primary: 'sendListening', secondary: 'edit', tertiary: 'cancel' },
  userEdit: { primary: 'sendEditing', secondary: 'cancelEdit' },
  waitingForUserSubmit: { primary: 'sendIdle', secondary: 'editAgain', tertiary: 'cancel' },
  evaluation: { primary: 'endSession' },
  error: { primary: 'endSession' },
  sessionEnded: {},
};

export default function ControlsArea({
  phase,
  messageCount,
  onStartListening,
  onStopListeningToSend,
  onCancelListening,
  onStopListeningToEdit,
  onCancelEditing,
  onEvaluationRequested,
  onEndSessionRequested,
  onStopEditingToSend,
  onSendIdle,
  onEditAgain,
}: ControlsAreaProps) {
  const buttonConfig: Record<
    ButtonId,
    { label: string; iconName?: IconName; onClick: () => void }
  > = {
    speak: { label: 'Reply', iconName: 'microphone', onClick: onStartListening },
    sendListening: { label: 'Send', iconName: 'send', onClick: onStopListeningToSend },
    cancel: { label: 'Cancel', iconName: 'cancel', onClick: onCancelListening },
    edit: { label: 'Edit', iconName: 'edit', onClick: onStopListeningToEdit },
    sendEditing: { label: 'Send edit', iconName: 'send', onClick: onStopEditingToSend },
    cancelEdit: { label: 'Cancel edit', iconName: 'cancel', onClick: onCancelEditing },
    sendIdle: { label: 'Send', iconName: 'send', onClick: onSendIdle },
    editAgain: { label: 'Edit toch maar weer', iconName: 'edit', onClick: onEditAgain },
    evaluate: { label: 'Evaluate', iconName: 'evaluation', onClick: onEvaluationRequested },
    endSession: { label: 'End session', iconName: 'finish', onClick: onEndSessionRequested },
  };
  const stage: ChatStage = getChatStage(phase);
  const stageButtons = buttonsByStage[stage];

  return (
    <div className={styles.controlsArea}>
      <div className={styles.actions}>
        {priorityOrder.map((priority) => {
          const buttonId = stageButtons[priority];
          if (!buttonId) return null;

          const { onClick, iconName } = buttonConfig[buttonId];
          const label = getLabel(buttonId);
          return (
            <Button
              key={buttonId}
              variant={priority === 'primary' ? 'primary' : 'secondary'}
              onClick={onClick}
              disabled={buttonIsDisabled(buttonId, phase, messageCount)}
              iconName={iconName}
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
    case 'sendListening':
      return !canRequestSend(phase);
    case 'cancel':
      return !canRequestCancel(phase);
    case 'evaluate':
      return !canRequestEvaluation(phase, messageCount);
    default:
      return false;
  }
}
