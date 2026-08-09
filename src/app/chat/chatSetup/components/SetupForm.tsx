import { useState } from 'react';

import Feedback from '@/components/Feedback';
import Button from '@/components/button/Button';
import { type ChatConfig, getChatConfig, defaultStarter } from '@/lib/chatConfig';
import {
  languageLevels,
  type Language,
  type LanguageLevelName,
  type LanguageLevel,
} from '@/lib/language';
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
  selectedLevel: LanguageLevel;
  onChangeLanguage: (language: Language) => void;
  onChangeLevel: (levelName: LanguageLevelName) => void;
  onStartSession: (chatConfig: ChatConfig) => void;
  speechSupportIsChecked: boolean;
  supportedLanguageVoices: SupportedLanguageVoices;
};

export default function SetupForm({
  languages,
  selectedLanguage,
  selectedLevel,
  onStartSession,
  onChangeLanguage,
  onChangeLevel,
  speechSupportIsChecked,
  supportedLanguageVoices,
}: SetupFormProps) {
  const [starter, setStarter] = useState<Starter>(defaultStarter);
  const speechRecognitionIsSupportedClientSide = useSpeechRecognitionIsSupported();

  const levelOptions: SegmentedControlOption<LanguageLevelName>[] = languageLevels.map((level) => ({
    label: level.name,
    value: level.name,
  }));

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
        groupName="level"
        groupLabel="What level?"
        options={levelOptions}
        selectedValue={selectedLevel.name}
        onSelect={onChangeLevel}
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
    const chatConfig = getChatConfig(selectedLanguage, selectedLevel, scenario);

    onStartSession(chatConfig);
  }
}
