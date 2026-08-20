import {
  isReadyForUserStart,
  canRequestEvaluation,
  canRequestEdit,
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
  onsendAfterEditCancelled: () => void;
  oneditAfterEditCancelled: () => void;
  oncancelAfterEditCancelled: () => void;
};

type ButtonPriority = 'primary' | 'secondary' | 'tertiary';
type ButtonId =
  | 'speak'
  | 'sendWhenListening'
  | 'cancel'
  | 'edit'
  | 'sendWhenEditing'
  | 'cancelEdit'
  | 'sendAfterEditCancelled'
  | 'editAfterEditCancelled'
  | 'cancelAfterEditCancelled'
  | 'evaluate'
  | 'endSession';

const priorityOrder = ['primary', 'secondary', 'tertiary'] as const satisfies ButtonPriority[];
const buttonsByStage: Record<ChatStage, Partial<Record<ButtonPriority, ButtonId>>> = {
  aiTurnStage: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' },
  userTurnStage: { primary: 'sendWhenListening', secondary: 'edit', tertiary: 'cancel' },
  userEditStage: { primary: 'sendWhenEditing', secondary: 'edit', tertiary: 'cancelEdit' }, // keep edit button for consistency. It will be disabled.
  editCancelledStage: {
    primary: 'sendAfterEditCancelled',
    secondary: 'editAfterEditCancelled',
    tertiary: 'cancelAfterEditCancelled',
  },
  evaluationStage: { primary: 'endSession' },
  errorStage: { primary: 'endSession' },
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
  onsendAfterEditCancelled,
  oneditAfterEditCancelled,
  oncancelAfterEditCancelled,
}: ControlsAreaProps) {
  const buttonConfig: Record<
    ButtonId,
    { label: string; iconName?: IconName; onClick: () => void }
  > = {
    speak: { label: 'Reply', iconName: 'microphone', onClick: onStartListening },
    sendWhenListening: { label: 'Send', iconName: 'send', onClick: onStopListeningToSend },
    cancel: { label: 'Cancel', iconName: 'cancel', onClick: onCancelListening },
    edit: { label: 'Edit', iconName: 'edit', onClick: onStopListeningToEdit },
    sendWhenEditing: { label: 'Send', iconName: 'send', onClick: onStopEditingToSend },
    cancelEdit: { label: 'Cancel edit', iconName: 'cancel', onClick: onCancelEditing },
    sendAfterEditCancelled: { label: 'Send', iconName: 'send', onClick: onsendAfterEditCancelled },
    editAfterEditCancelled: { label: 'Edit', iconName: 'edit', onClick: oneditAfterEditCancelled },
    cancelAfterEditCancelled: {
      label: 'Cancel',
      iconName: 'cancel',
      onClick: oncancelAfterEditCancelled,
    },
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
    case 'sendWhenListening':
      return !canRequestSend(phase);
    case 'cancel':
      return !canRequestCancel(phase);
    case 'evaluate':
      return !canRequestEvaluation(phase, messageCount);
    case 'edit':
      return !canRequestEdit(phase);
    default:
      return false;
  }
}
