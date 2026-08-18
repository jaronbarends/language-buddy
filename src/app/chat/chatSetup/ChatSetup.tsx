import PageHeading from '@/components/PageHeading';
import { type ConversationConfig } from '@/lib/conversationConfig';
import { type Language, LanguageLevel, LanguageLevelName } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';
import { type Scenario } from '@/lib/scenarios';

import SetupForm from './components/SetupForm';

import styles from './ChatSetup.module.css';

type ChatSetupProps = {
  languages: Language[];
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
  selectedLevel: LanguageLevel;
  onChangeLevel: (levelName: LanguageLevelName) => void;
  freeformScenarios: Scenario[];
  selectedScenario: Scenario;
  onChangeScenario: (scenario: Scenario) => void;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
  onStartSession: (conversationConfig: ConversationConfig) => void;
};

export default function ChatSetup({
  languages,
  selectedLanguage,
  selectedLevel,
  freeformScenarios,
  selectedScenario,
  speechSupportIsChecked,
  supportedLanguageVoices,
  onStartSession,
  onChangeLanguage,
  onChangeLevel,
  onChangeScenario,
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
        languages={languages}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={onChangeLanguage}
        selectedLevel={selectedLevel}
        onChangeLevel={onChangeLevel}
        freeformScenarios={freeformScenarios}
        selectedScenario={selectedScenario}
        onChangeScenario={onChangeScenario}
        speechSupportIsChecked={speechSupportIsChecked}
        supportedLanguageVoices={supportedLanguageVoices}
        onStartSession={onStartSession}
      />
    </div>
  );
}
