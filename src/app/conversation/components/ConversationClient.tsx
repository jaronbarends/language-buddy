'use client';

import { useReducer, useEffect } from 'react';

import { sendChatMessage, type AIChatResult } from '@/lib/aiService';

import { chatReducer, type ChatState, type ChatAction } from '../chatReducer';
import ChatArea from './ChatArea';
import ControlsArea from './ControlsArea';

import styles from './ConversationClient.module.css';

export default function ConversationClient() {
  const initialState: ChatState = { status: 'idle' };
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <>
      <div className={styles.component}>
        <ChatArea {...{ state }} />
        <ControlsArea
          onStartChat={handleStartChat}
          onStopChat={handleStopChat}
          onStartListening={handleStartListening}
          {...{ state }}
        />
      </div>
      <div className={styles.status}>status: {state.status}</div>
    </>
  );

  async function handleStartChat() {
    dispatch({ type: 'START_CHAT' });
    console.log('call sendChatMessage');
    const reply: AIChatResult = await sendChatMessage();
    console.log('reply:', reply);
  }

  function handleStopChat() {
    dispatch({ type: 'STOP_CHAT' });
  }

  function handleStartListening() {
    dispatch({ type: 'START_LISTENING' });
  }
}
