'use client';

import { useState } from 'react';

import { type ChatConfig } from '@/lib/chatConfig';
import { type Language } from '@/lib/language';
import { supportedLanguages } from '@/lib/languages';

import ChatConversation from './chatConversation/ChatConversation';
import ChatSetup from './chatSetup/ChatSetup';

type ContainerState = { status: 'setup' } | { status: 'conversation'; chatConfig: ChatConfig };

export default function ChatContainer() {
  const initialLanguage = supportedLanguages[0];
  const [containerState, setContainerState] = useState<ContainerState>({ status: 'setup' });
  const [language, setLanguage] = useState<Language>(initialLanguage);

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
        <ChatConversation chatConfig={containerState.chatConfig} onEndSession={handleSessionEnd} />
      )}
    </>
  );

  function handleSessionStart(chatConfig: ChatConfig) {
    setContainerState({ status: 'conversation', chatConfig });
  }

  function handleSessionEnd() {
    setContainerState({ status: 'setup' });
  }
}
