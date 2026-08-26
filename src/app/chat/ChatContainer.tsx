'use client';
import { useState, useEffect } from 'react';

import { type ConversationConfig } from '@/lib/conversationConfig';
import { CEFRLevel, type Language, type LanguageVoice } from '@/lib/language';
import {
  type SupportedLanguageVoices,
  type LanguageLevel,
  getLanguageLevelByName,
  getLanguageLevelByCEFRLevel,
} from '@/lib/language';
import { supportedLanguages } from '@/lib/languages';
import { freeformScenarios, type Scenario } from '@/lib/scenarios';
import { initSpeech } from '@/lib/textToSpeech';

import ChatConversation from './chatConversation/ChatConversation';
import ChatSetup from './chatSetup/ChatSetup';

type ContainerState =
  { status: 'setup' } | { status: 'conversation'; conversationConfig: ConversationConfig };

export default function ChatContainer() {
  const [containerState, setContainerState] = useState<ContainerState>({ status: 'setup' });
  const initialLanguage = getInitialLanguage();
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [speechSupportIsChecked, setSpeechSupportIsChecked] = useState<boolean>(false);
  const [speechIsSupported, setSpeechIsSupported] = useState<boolean>(false);
  const [supportedLanguageVoices, setSupportedLanguageVoices] = useState<SupportedLanguageVoices>(
    {}
  );
  const initialLevel: LanguageLevel = getLanguageLevelByName('Intermediate');
  const [level, setLevel] = useState<LanguageLevel>(initialLevel);
  const initialScenario = getInitialScenario();
  const [scenario, setScenario] = useState<Scenario>(initialScenario);

  useEffect(() => {
    initSpeech(handleSpeechInitSuccess, handleSpeechInitFail);
  }, []);

  const languageVoice: LanguageVoice = supportedLanguageVoices[language.languageTag];

  return (
    <>
      {containerState.status === 'setup' ?
        <ChatSetup
          languages={supportedLanguages}
          selectedLanguage={language}
          onChangeLanguage={setLanguage}
          selectedLevel={level}
          onChangeLevel={handleChangeLevel}
          freeformScenarios={freeformScenarios}
          selectedScenario={scenario}
          onChangeScenario={setScenario}
          speechSupportIsChecked={speechSupportIsChecked}
          supportedLanguageVoices={supportedLanguageVoices}
          onStartSession={handleSessionStart}
        />
      : <ChatConversation
          conversationConfig={containerState.conversationConfig}
          languageVoice={languageVoice}
          openingHint={scenario.openingHint}
          onEndSession={handleSessionEnd}
        />
      }
    </>
  );

  function handleSessionStart(conversationConfig: ConversationConfig) {
    if (speechIsSupported) {
      unlockSpeechSynthesis();
    }
    setContainerState({ status: 'conversation', conversationConfig });
  }

  function handleSessionEnd() {
    setContainerState({ status: 'setup' });
  }

  function handleSpeechInitSuccess(voices: SpeechSynthesisVoice[]) {
    setSpeechSupportIsChecked(true);
    setSpeechIsSupported(true);
    const supportedLanguageTags = supportedLanguages.map((l) => l.languageTag);
    const supportedVoices: SupportedLanguageVoices = {};
    voices.forEach((voice) => {
      const lang = voice.lang;
      if (supportedLanguageTags.includes(lang) && supportedVoices[lang] === undefined) {
        supportedVoices[lang] = voice;
      }
    });
    setSupportedLanguageVoices(supportedVoices);
  }

  function handleSpeechInitFail() {
    setSpeechSupportIsChecked(true);
    setSpeechIsSupported(false);
  }

  function getInitialLanguage(): Language {
    if (process.env.NEXT_PUBLIC_INITIAL_LANGUAGE_DUTCH === 'true') {
      const dutchLanguage = supportedLanguages.find((language) => language.languageTag === 'nl-NL');
      if (dutchLanguage) {
        return dutchLanguage;
      }
    }

    const initiallySelectedLanguage = supportedLanguages.find(
      (language) => language.initiallySelected
    );
    if (initiallySelectedLanguage) {
      return initiallySelectedLanguage;
    }
    // should never happen, just return the first
    return supportedLanguages[0];
  }

  function getInitialScenario(): Scenario {
    const initiallySelectedScenario = freeformScenarios.find(
      (scenario) => scenario.initiallySelected
    );
    if (initiallySelectedScenario) {
      return initiallySelectedScenario;
    }
    // should never happen, just return the first
    return freeformScenarios[0];
  }

  // function handleChangeLevel(name: LanguageLevelName) {
  function handleChangeLevel(cefrLevel: CEFRLevel) {
    // const level = getLanguageLevelByName(name);
    const level = getLanguageLevelByCEFRLevel(cefrLevel);
    setLevel(level);
  }
}

/*
WebKit only allows speechSynthesis.speak() to actually produce audio when it's called synchronously inside a user-gesture handler. Such permission needs to be granted on echey page load.
*/
function unlockSpeechSynthesis() {
  const unlockUtterance = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(unlockUtterance);
}
