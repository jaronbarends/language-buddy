'use client';

import { useReducer, useState, useRef, useEffect } from 'react';

import { sendChatMessage, type AIChatResult } from '@/lib/aiService';

import { chatReducer, type ChatState } from '../chatReducer';
import ChatView from './ChatView';
import ControlsArea from './ControlsArea';
import MockTTS from './MockTTS';

import styles from './ChatClient.module.css';

// systemInstruction should also include scenario
const systemInstruction =
  'you are a norwegian speaker. no matter the input language, always reply in norwegian bokmal';

const aiHasFirstTurn = false;

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
        <MockTTS />
        <ControlsArea
          onStartChat={handleStartChat}
          onStopChat={handleStopChat}
          onStartListening={handleStartListening}
          onSendUserMessage={handleSendUserMessage}
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
    startListening();
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

  function startChatWithUser() {
    console.log('start chat with user');
    dispatch({ type: 'START_CHAT_WITH_USER' });
  }

  function startListening() {
    console.log('start listening');
    dispatch({ type: 'START_LISTENING' });
    // create speech thing here
  }

  async function handleSendUserMessage() {
    // stop listening; parse results
    const defaultInput = 'tell me more about the city you just mentioned';
    const mockTTS = document.getElementById('mockTTS');
    const mockTTSValue = mockTTS?.value;
    const input = mockTTSValue || defaultInput;
    if (mockTTS) {
      mockTTS.value = '';
    }

    dispatch({ type: 'USER_MESSAGE_SENT' });
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
    dispatch({ type: 'AI_RESPONSE_RECEIVED', payload: { message } });
  }

  function speakAIResponse(message) {
    console.log('speak ai response: ', message);
    // use TTS finish event
    console.log(`[SpeechToText's last utterance's end event fires]`);
    setTimeout(() => {
      dispatch({ type: 'AI_FINISHED_SPEAKING' });
    }, 500);
  }
}
