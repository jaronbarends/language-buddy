import { Language } from '@/lib/language';

import { type ChatPhase } from '../chatReducer';

import styles from './DevHelper.module.css';

type DevHelperProps = {
  phase: ChatPhase;
  language: Language;
};

export default function DevHelper({ phase, language }: DevHelperProps) {
  const aiType = process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true' ? 'mock AI' : 'real API';
  return (
    <div className={styles.devHelper}>
      <div>status: {phase.status}</div>
      <div>language: {language.languageTag}</div>
      <div>using {aiType}</div>
    </div>
  );
}
