import PageHeading from '@/components/PageHeading';
import { type ChatConfig } from '@/lib/chatConfig';
import { type Language, LanguageLevel, LanguageLevelName } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';

import SetupForm from './components/SetupForm';

import styles from './ChatSetup.module.css';

type ChatSetupProps = {
  languages: Language[];
  selectedLanguage: Language;
  selectedLevel: LanguageLevel;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
  onChangeLanguage: (language: Language) => void;
  onChangeLevel: (levelName: LanguageLevelName) => void;
  onStartSession: (chatConfig: ChatConfig) => void;
};

export default function ChatSetup({
  languages,
  selectedLanguage,
  selectedLevel,
  speechSupportIsChecked,
  supportedLanguageVoices,
  onStartSession,
  onChangeLanguage,
  onChangeLevel,
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
        onChangeLevel={onChangeLevel}
        languages={languages}
        selectedLanguage={selectedLanguage}
        selectedLevel={selectedLevel}
        speechSupportIsChecked={speechSupportIsChecked}
        supportedLanguageVoices={supportedLanguageVoices}
      />
    </div>
  );
}
