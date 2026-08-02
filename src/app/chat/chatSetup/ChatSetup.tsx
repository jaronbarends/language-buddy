import { useState } from 'react';

import Button from '@/components/button/Button';
import { type ChatConfig, getChatConfig } from '@/lib/chatConfig';
import { type Language } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';
import { freeformChatWithAIStart, freeformChatWithUserStart } from '@/lib/scenarios';

import LanguagePicker from './components/LanguagePicker';

import styles from './ChatSetup.module.css';

type ChatSetupProps = {
  languages: Language[];
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
  onStartSession: (chatConfig: ChatConfig) => void;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
};

type Starter = 'ai' | 'user';

export default function ChatSetup({
  languages,
  selectedLanguage,
  onStartSession,
  onChangeLanguage,
  speechSupportIsChecked,
  supportedLanguageVoices,
}: ChatSetupProps) {
  const [starter, setStarter] = useState<Starter>('ai');
  return (
    <div className={styles.setup}>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Choose your language</legend>
          <LanguagePicker
            languages={languages}
            selectedLanguage={selectedLanguage}
            onChangeLanguage={onChangeLanguage}
            supportedLanguageVoices={supportedLanguageVoices}
          />
        </fieldset>
        <fieldset>
          <legend>Who should start the conversation?</legend>
          <input
            type="radio"
            id="chat-ai-starts"
            value="ai"
            name="starter"
            checked={starter === 'ai'}
            onChange={(event) => {
              setStarter(event.target.value as Starter);
            }}
          />
          <label htmlFor="chat-ai-starts">AI should start</label>

          <input
            type="radio"
            id="chat-user-starts"
            value="user"
            name="starter"
            checked={starter === 'user'}
            onChange={(event) => {
              setStarter(event.target.value as Starter);
            }}
          />
          <label htmlFor="chat-user-starts">I will start</label>
        </fieldset>
        <div>
          <Button type="submit" disabled={!speechSupportIsChecked}>
            Start conversation
          </Button>
        </div>
      </form>
    </div>
  );

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    const scenario = starter === 'ai' ? freeformChatWithAIStart : freeformChatWithUserStart;
    const chatConfig = getChatConfig(selectedLanguage, scenario);

    onStartSession(chatConfig);
  }
}
