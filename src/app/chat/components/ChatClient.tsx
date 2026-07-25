'use client';

import { useReducer, useState, useRef } from 'react';

import { sendChatMessage, type AIChatResult } from '@/lib/aiService';

import { chatReducer, type ChatState, type ChatAction } from '../chatReducer';
import ChatView from './ChatView';
import ControlsArea from './ControlsArea';

import styles from './ChatClient.module.css';

const systemInstruction =
  'you are a norwegian speaker. no matter the input language, always reply in norwegian bokmal';

export default function ChatClient() {
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>();
  const initalChatState: ChatState = { status: 'idle' };
  const [state, dispatch] = useReducer(chatReducer, initalChatState);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  return (
    <>
      <div className={styles.component}>
        <ChatView {...{ state }} />
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

  function handleStartChat() {
    dispatch({ type: 'START_CHAT' });
    startChat();
  }

  function handleStopChat() {
    dispatch({ type: 'STOP_CHAT' });
    console.log('stop');
    abortControllerRef.current?.abort();
  }

  function handleStartListening() {
    // dispatch({ type: 'START_LISTENING' });
    // TODO: set up listening

    dispatch({ type: 'USER_REPLY_SENT' });
    sendUserReply();
  }

  async function startChat() {
    abortControllerRef.current = new AbortController();
    const input = 'what is the capital of the netherlands?';

    const reply: AIChatResult = await sendChatMessage({
      input,
      systemInstruction,
      abortSignal: abortControllerRef.current.signal,
    });
    console.log('reply:', reply);
    if (!reply.success) {
      // TODO
      console.log('dispatch stop');
      dispatch({ type: 'ERROR', payload: { message: 'oops' } });
      return;
    }
    const { interactionId, message } = reply;
    setPreviousInteractionId(interactionId);
    dispatch({ type: 'AI_CHAT_CREATED', payload: { firstTurn: 'ai' } });
  }

  async function sendUserReply() {
    const input = 'tell me more about the city you just mentioned';
    console.log('sendUserReply - call sendChatMessage');
    const reply: AIChatResult = await sendChatMessage({
      input,
      previousInteractionId,
      systemInstruction,
    });
    console.log('reply:', reply);
    if (!reply.success) {
      // TODO
      console.log('dispatch stop');
      dispatch({ type: 'ERROR', payload: { message: 'oops' } });
      return;
    }
    const { interactionId, message } = reply;
    setPreviousInteractionId(interactionId);
  }
}
