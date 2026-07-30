'use client';

import { useState } from 'react';

import { type ChatConfig } from '@/lib/chatConfig';

import ChatConversation from './chatConversation/ChatConversation';
import ChatSetup from './chatSetup/ChatSetup';

type ContainerState = { status: 'setup' } | { status: 'conversation'; chatConfig: ChatConfig };

export default function ChatContainer() {
  const [containerState, setContainerState] = useState<ContainerState>({ status: 'setup' });

  return (
    <>
      {containerState.status === 'setup' ? (
        <ChatSetup onStartSession={handleSessionStart} />
      ) : (
        <ChatConversation chatConfig={containerState.chatConfig} onEndSession={handleSessionEnd} />
      )}
    </>
  );

  function handleSessionStart(chatConfig: ChatConfig) {
    setContainerState({ status: 'conversation', chatConfig });
  }

  function handleSessionEnd() {
    console.log('handle conv end');
    setContainerState({ status: 'setup' });
  }
}
