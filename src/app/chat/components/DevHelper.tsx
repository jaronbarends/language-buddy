import { type ChatPhase } from '../chatReducer';

import styles from './DevHelper.module.css';

type DevHelperProps = {
  phase: ChatPhase;
};

export default function DevHelper({ phase }: DevHelperProps) {
  const aiType = process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? 'mock AI' : 'real API';
  return (
    <div className={styles.devHelper}>
      <div>status: {phase.status}</div>
      <div>using {aiType}</div>
    </div>
  );
}
