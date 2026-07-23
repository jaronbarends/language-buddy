'use client';

import { useReducer } from 'react';

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
        <ControlsArea onStartChat={handleStartChat} onStopChat={handleStopChat} {...{ state }} />
      </div>
      <div className={styles.status}>status: {state.status}</div>
    </>
  );

  function handleStartChat() {
    dispatch({ type: 'START_CHAT' });
  }

  function handleStopChat() {
    dispatch({ type: 'STOP_CHAT' });
  }
}
