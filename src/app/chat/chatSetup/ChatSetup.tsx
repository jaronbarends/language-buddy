import PageHeading from '@/components/PageHeading';
import { type ChatConfig } from '@/lib/chatConfig';
import { type Language } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';

import SetupForm from './components/SetupForm';

import styles from './ChatSetup.module.css';

type ChatSetupProps = {
  languages: Language[];
  selectedLanguage: Language;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
  onChangeLanguage: (language: Language) => void;
  onStartSession: (chatConfig: ChatConfig) => void;
};

export default function ChatSetup({
  languages,
  selectedLanguage,
  speechSupportIsChecked,
  supportedLanguageVoices,
  onStartSession,
  onChangeLanguage,
}: ChatSetupProps) {
  return (
    <div className={styles.chatSetup}>
      <header className={styles.pageHeader}>
        <PageHeading>
          <h1>Language buddy</h1>
          <p className={styles.payoff}>Practice speaking out loud</p>
        </PageHeading>
      </header>
      <SetupForm
        onStartSession={onStartSession}
        onChangeLanguage={onChangeLanguage}
        languages={languages}
        selectedLanguage={selectedLanguage}
        speechSupportIsChecked={speechSupportIsChecked}
        supportedLanguageVoices={supportedLanguageVoices}
      />
    </div>
  );
}
