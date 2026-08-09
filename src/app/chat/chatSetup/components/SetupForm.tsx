import { useState } from 'react';

import Feedback from '@/components/Feedback';
import Button from '@/components/button/Button';
import { type ChatConfig, getChatConfig } from '@/lib/chatConfig';
import { type Language } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';
import { type Starter } from '@/lib/scenarios';
import { freeformChatWithAIStart, freeformChatWithUserStart } from '@/lib/scenarios';
import { useSpeechRecognitionIsSupported } from '@/lib/speechRecognition';

import LanguagePicker from './LanguagePicker';
import SegmentedControl, { type SegmentedControlOption } from './SegmentedControl';

import styles from './SetupForm.module.css';

type SetupFormProps = {
  languages: Language[];
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
  onStartSession: (chatConfig: ChatConfig) => void;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
};

export default function SetupForm({
  languages,
  selectedLanguage,
  onStartSession,
  onChangeLanguage,
  speechSupportIsChecked,
  supportedLanguageVoices,
}: SetupFormProps) {
  const [starter, setStarter] = useState<Starter>('ai');
  const speechRecognitionIsSupportedClientSide = useSpeechRecognitionIsSupported();

  const starterOptions: SegmentedControlOption<Starter>[] = [
    { label: 'AI should start', value: 'ai' },
    { label: 'I will start', value: 'user' },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.setupForm}>
      <LanguagePicker
        languages={languages}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={onChangeLanguage}
        supportedLanguageVoices={supportedLanguageVoices}
        speechSupportIsChecked={speechSupportIsChecked}
      />
      <SegmentedControl
        groupName="starter"
        groupLabel="Who should start the conversation?"
        options={starterOptions}
        selectedValue={starter}
        onSelect={setStarter}
      />
      {speechSupportIsChecked && !speechRecognitionIsSupportedClientSide && (
        <Feedback type="error">
          <div role="alert">
            This app needs speech recognition; this browser does not support that. Use another
            browser (like Chrome or Safari)
          </div>
        </Feedback>
      )}
      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={!speechSupportIsChecked || !speechRecognitionIsSupportedClientSide}
          fontSize="large"
        >
          Start conversation
        </Button>
      </div>
    </form>
  );

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    const scenario = starter === 'ai' ? freeformChatWithAIStart : freeformChatWithUserStart;
    const chatConfig = getChatConfig(selectedLanguage, scenario);

    onStartSession(chatConfig);
  }
}
