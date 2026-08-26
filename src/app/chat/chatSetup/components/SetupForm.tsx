import clsx from 'clsx';
import { Fragment } from 'react';

import Feedback from '@/components/Feedback';
import TooltipIcon from '@/components/TooltipIcon';
import Button from '@/components/button/Button';
import { type ConversationConfig, getConversationConfig } from '@/lib/conversationConfig';
import {
  languageLevels,
  type Language,
  type LanguageLevelName,
  type LanguageLevel,
} from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';
import { type Starter } from '@/lib/scenarios';
import { type Scenario } from '@/lib/scenarios';
import { useSpeechRecognitionIsSupported } from '@/lib/speechRecognition';

import LanguagePicker from './LanguagePicker';
import SegmentedControl, { type SegmentedControlOption } from './SegmentedControl';

import styles from './SetupForm.module.css';

type SetupFormProps = {
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

export default function SetupForm({
  languages,
  selectedLanguage,
  selectedLevel,
  freeformScenarios,
  selectedScenario,
  onStartSession,
  onChangeLanguage,
  onChangeLevel,
  onChangeScenario,
  speechSupportIsChecked,
  supportedLanguageVoices,
}: SetupFormProps) {
  const speechRecognitionIsSupportedClientSide = useSpeechRecognitionIsSupported();

  const levelOptions: SegmentedControlOption<LanguageLevelName>[] = languageLevels.map((level) => ({
    label: level.cefrLevel,
    value: level.name,
  }));

  const starterOptions: SegmentedControlOption<Starter>[] = [
    { label: 'AI', value: 'ai', iconName: 'ai' },
    { label: 'Me', value: 'user', iconName: 'user' },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.setupForm}>
      <fieldset>
        <legend className={styles.legend}>Choose your practice language</legend>
        <LanguagePicker
          languages={languages}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={onChangeLanguage}
          supportedLanguageVoices={supportedLanguageVoices}
          speechSupportIsChecked={speechSupportIsChecked}
        />
      </fieldset>
      <fieldset>
        <legend className={clsx(styles.legend, styles.levelLegend)}>
          What is your level? <LevelTooltip />
        </legend>
        <SegmentedControl
          groupName="level"
          options={levelOptions}
          selectedValue={selectedLevel.name}
          onSelect={onChangeLevel}
        />
      </fieldset>
      <fieldset>
        <legend className={styles.legend}>Who should start the conversation?</legend>
        <SegmentedControl
          groupName="starter"
          options={starterOptions}
          selectedValue={selectedScenario.starter}
          onSelect={handleSelectFreeformScenario}
        />
      </fieldset>
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
          iconName="chat"
        >
          Start chat
        </Button>
      </div>
    </form>
  );

  function handleSelectFreeformScenario(starter: Starter) {
    const scenario = freeformScenarios.find((s) => s.starter === starter);
    if (scenario) {
      onChangeScenario(scenario);
    } else {
      //falback; should never happen
      onChangeScenario(freeformScenarios[0]);
    }
  }

  function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
    evt.preventDefault();

    const conversationConfig = getConversationConfig(
      selectedLanguage,
      selectedLevel,
      selectedScenario
    );

    onStartSession(conversationConfig);
  }
}

function LevelTooltip() {
  return (
    <TooltipIcon ariaLabel="What do the level codes mean?">
      <dl className={styles.levelsList}>
        {languageLevels.map((level) => (
          <Fragment key={level.cefrLevel}>
            <dt>{level.cefrLevel}:</dt>
            <dd>{level.name}</dd>
          </Fragment>
        ))}
      </dl>
    </TooltipIcon>
  );
}
