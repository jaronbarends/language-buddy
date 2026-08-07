'use client';
import { useState, useEffect } from 'react';

import { type ChatConfig } from '@/lib/chatConfig';
import { type Language, type LanguageVoice } from '@/lib/language';
import { type SupportedLanguageVoices } from '@/lib/language';
import { supportedLanguages } from '@/lib/languages';
import { initSpeech } from '@/lib/textToSpeech';

import ChatConversation from './chatConversation/ChatConversation';
import ChatSetup from './chatSetup/ChatSetup';

type ContainerState = { status: 'setup' } | { status: 'conversation'; chatConfig: ChatConfig };

export default function ChatContainer() {
  const initialLanguage = supportedLanguages[0];
  const [containerState, setContainerState] = useState<ContainerState>({ status: 'setup' });
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [speechSupportIsChecked, setSpeechSupportIsChecked] = useState<boolean>(false);
  const [speechIsSupported, setSpeechIsSupported] = useState<boolean>(false);
  const [supportedLanguageVoices, setSupportedLanguageVoices] = useState<SupportedLanguageVoices>(
    {}
  );

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
          speechSupportIsChecked={speechSupportIsChecked}
          supportedLanguageVoices={supportedLanguageVoices}
          onStartSession={handleSessionStart}
          onChangeLanguage={setLanguage}
        />
      : <ChatConversation
          onEndSession={handleSessionEnd}
          chatConfig={containerState.chatConfig}
          languageVoice={languageVoice}
        />
      }
    </>
  );

  function handleSessionStart(chatConfig: ChatConfig) {
    if (speechIsSupported) {
      unlockSpeechSynthesis();
    }
    setContainerState({ status: 'conversation', chatConfig });
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
}

/*
WebKit only allows speechSynthesis.speak() to actually produce audio when it's called synchronously inside a user-gesture handler. Such permission needs to be granted on echey page load.
*/
function unlockSpeechSynthesis() {
  const unlockUtterance = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(unlockUtterance);
}
