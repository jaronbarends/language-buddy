import { type LanguageVoice } from '@/lib/language';

import styles from './AIThreadItemContent.module.css';

type AIThreadItemContentProps = {
  message: string;
  languageVoice: LanguageVoice;
};

export function AIThreadItemContent({ message, languageVoice }: AIThreadItemContentProps) {
  return <div className={styles.itemContent}>{message}</div>;
}
