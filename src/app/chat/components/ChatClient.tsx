'use client';

import { useReducer, useState, useRef, useEffect } from 'react';

import { sendChatMessage, type AIChatResult } from '@/lib/aiService';

import { chatReducer, type ChatState, type ChatAction } from '../chatReducer';
import ChatView from './ChatView';
import ControlsArea from './ControlsArea';

import styles from './ChatClient.module.css';

// systemInstruction should also include scenario
const systemInstruction =
  'you are a norwegian speaker. no matter the input language, always reply in norwegian bokmal';

const aiHasFirstTurn = true;

export default function ChatClient() {
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>();
  const initalChatState: ChatState = { status: 'idle' };
  const [state, dispatch] = useReducer(chatReducer, initalChatState);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (state.status !== 'aiTurnSpeaking') {
      return;
    }
    speakAIResponse(state.message);
  }, [state]);

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
    if (aiHasFirstTurn) {
      startChatWithAI();
    } else {
      startChatWithUser();
    }
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

  async function startChatWithAI() {
    abortControllerRef.current = new AbortController();
    const input = 'what is the capital of the netherlands?';

    dispatch({ type: 'AI_START_INPUT_SENT' });
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
    dispatch({ type: 'AI_RESPONSE_RECEIVED', payload: { message } });
  }

  function startChatWithUser() {}

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

  function speakAIResponse(message) {
    console.log('speak ai response: ', message);
    // use TTS finish event
    setTimeout(() => {
      dispatch({ type: 'AI_FINISHED_SPEAKING' });
    }, 500);
  }
}
