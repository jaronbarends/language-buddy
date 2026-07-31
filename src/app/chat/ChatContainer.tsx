'use client';
import { useState, useEffect } from 'react';

import { type ChatConfig } from '@/lib/chatConfig';
import { type Language, type LanguageVoice } from '@/lib/language';
import { supportedLanguages } from '@/lib/languages';
import { initSpeech } from '@/lib/textToSpeech';

import ChatConversation from './chatConversation/ChatConversation';
import ChatSetup from './chatSetup/ChatSetup';

type ContainerState = { status: 'setup' } | { status: 'conversation'; chatConfig: ChatConfig };

type SupportedLanguageVoices = Record<string, SpeechSynthesisVoice>;

export default function ChatContainer() {
  const initialLanguage = supportedLanguages[0];
  const [containerState, setContainerState] = useState<ContainerState>({ status: 'setup' });
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [speechIsSupported, setSpeechIsSupported] = useState<boolean>(false);
  const [supportedLanguageVoices, setSupportedLanguageVoices] = useState<SupportedLanguageVoices>(
    {}
  );
  const [languageVoice, setLanguageVoice] = useState<LanguageVoice>();

  // TODO: check which languages are supported by speechSynthesis
  useEffect(() => {
    initSpeech(handleSpeechInitSuccess, handleSpeechInitFail);
  }, []);

  useEffect(() => {
    setLanguageVoice(supportedLanguageVoices[language.languageTag]);
  }, [language, supportedLanguageVoices]);

  return (
    <>
      {containerState.status === 'setup' ? (
        <ChatSetup
          onStartSession={handleSessionStart}
          onChangeLanguage={setLanguage}
          languages={supportedLanguages}
          selectedLanguage={language}
        />
      ) : (
        <ChatConversation
          chatConfig={containerState.chatConfig}
          onEndSession={handleSessionEnd}
          languageVoice={languageVoice}
        />
      )}
    </>
  );

  function handleSessionStart(chatConfig: ChatConfig) {
    if (languageVoice) {
      unlockSpeechSynthesis();
    }
    setContainerState({ status: 'conversation', chatConfig });
  }

  function handleSessionEnd() {
    setContainerState({ status: 'setup' });
  }

  function handleSpeechInitSuccess(voices: SpeechSynthesisVoice[]) {
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
