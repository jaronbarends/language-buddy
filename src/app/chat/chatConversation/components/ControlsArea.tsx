import {
  canRequestEvaluation,
  canRequestCancel,
  canSpeak,
  getControlsStage,
  type ChatPhase,
  type ControlsStage,
} from '@/app/chat/chatConversation/chatReducer';
import Button from '@/components/button/Button';

import styles from './ControlsArea.module.css';

type ControlsAreaProps = {
  phase: ChatPhase;
  onStartListening: () => void;
  // onStopChat: () => void;
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

type ButtonPriority = 'primary' | 'secondary' | 'tertiary';
type ButtonId = 'speak' | 'send' | 'cancel' | 'evaluate' | 'endSession';

export default function ControlsArea({
  phase,
  onStartListening,
  onSendRequested,
  onCancelListening,
  // onStopChat,
  onEvaluationRequested,
  onEndSessionRequested,
}: ControlsAreaProps) {
  // const primaryButtonProps = getPrimaryButtonProps(phase);

  const buttonsByStage: Record<ControlsStage, Partial<Record<ButtonPriority, ButtonId>>> = {
    aiInputFlow: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' },
    userInputFlow: { primary: 'send', secondary: 'cancel' },
    evaluation: { primary: 'endSession' },
    error: { primary: 'endSession' },
    sessionEnded: {},
  };

  const buttonConfig: Record<ButtonId, { label: string; onClick: () => void }> = {
    speak: { label: 'Speak', onClick: onStartListening },
    send: { label: 'Send', onClick: onSendRequested },
    cancel: { label: 'Cancel', onClick: onCancelListening },
    evaluate: { label: 'Evaluate', onClick: onEvaluationRequested },
    endSession: { label: 'End session', onClick: onEndSessionRequested },
  };
  const stage: ControlsStage = getControlsStage(phase);
  const priorityOrder: ButtonPriority[] = ['primary', 'secondary', 'tertiary'];
  const stageButtons = buttonsByStage[stage];

  return (
    <div className={styles.controlsArea}>
      <div className={styles.actions}>
        {priorityOrder.map((priority) => {
          const buttonId = stageButtons[priority];
          if (!buttonId) return null;
          const { label, onClick } = buttonConfig[buttonId];
          return (
            <Button
              key={buttonId}
              variant={priority === 'primary' ? 'primary' : 'secondary'}
              onClick={onClick}
              disabled={isButtonDisabled(buttonId, phase)}
            >
              {label}
            </Button>
          );
        })}
        {/* <Button
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
        {shouldShowEvaluationSecondaryButton(phase) && (
          <Button
            variant="secondary"
            onClick={onEvaluationRequested}
            disabled={!canRequestEvaluation(phase)}
          >
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
        )} */}
      </div>
    </div>
  );

  // function getPrimaryButtonProps(phase: ChatPhase): PrimaryButtonProps {
  //   if (canStartWithUser(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Start speaking',
  //       onClick: onStartListening,
  //     };
  //   }
  //   if (canStartReply(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Reply',
  //       onClick: onStartListening,
  //     };
  //   }
  //   if (canRequestSend(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Send',
  //       onClick: onSendRequested,
  //     };
  //   }
  //   if (canRequestSend(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Send',
  //       onClick: onSendRequested,
  //     };
  //   }
  //   if (isWaitingForAI(phase)) {
  //     return {
  //       variant: 'feedback',
  //       label: 'AI is thinking...',
  //       onClick: () => {},
  //       disabled: true,
  //     };
  //   }
  //   if (isAITurnSpeaking(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Reply',
  //       onClick: () => {},
  //       disabled: true,
  //     };
  //   }
  //   if (chatHasStopped(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'Evaluate',
  //       onClick: onEvaluationRequested,
  //     };
  //   }
  //   if (evaluationIsShown(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'End this session',
  //       onClick: onEndSessionRequested,
  //     };
  //   }
  //   if (hasError(phase)) {
  //     return {
  //       variant: 'primary',
  //       label: 'End this session',
  //       onClick: onEndSessionRequested,
  //     };
  //   }
  //   return {
  //     variant: 'feedback',
  //     label: 'Waiting...',
  //     onClick: () => {},
  //     disabled: true,
  //   };
  // }
}

function isButtonDisabled(buttonId: ButtonId, phase: ChatPhase): boolean {
  switch (buttonId) {
    case 'speak':
      return !canSpeak(phase);
    case 'cancel':
      return !canRequestCancel(phase);
    case 'evaluate':
      return !canRequestEvaluation(phase);
    default:
      return false;
  }
}
