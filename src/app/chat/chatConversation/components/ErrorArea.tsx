import { ChatPhase, hasError } from '@/app/chat/chatConversation/chatReducer';
import Feedback from '@/components/Feedback';

export default function ErrorArea({ phase }: { phase: ChatPhase }) {
  if (!hasError(phase)) {
    return <></>;
  }

  return <Feedback type="error">{phase.error.error}</Feedback>;
}
