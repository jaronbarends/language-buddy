'use client';

import { useReducer, useState, useRef, useEffect } from 'react';

import { chatReducer, type ChatState } from '@/app/chat/chatReducer';
import { sendChatMessage, type AIChatResult } from '@/lib/aiService';

import ControlsArea from './ControlsArea';
import ErrorArea from './ErrorArea';
import MockTTS from './MockTTS';
import ThreadView from './ThreadView';

import styles from './ChatClient.module.css';

// systemInstruction should also include scenario
const language = 'nb_NO';
// const language = 'nl_NL';
const systemInstruction = `You are a native speaker of ${language}. no matter the input language, always reply in ${language}. The reply should be plain text only.`;

const aiHasFirstTurn = true;

export default function ChatClient() {
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>();
  const initalChatState: ChatState = { threadItems: [], phase: { status: 'readyForNewChat' } };
  const [state, dispatch] = useReducer(chatReducer, initalChatState);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (state.phase.status !== 'aiTurnSpeaking') {
      return;
    }
    speakAIResponse(state.phase.message);
  }, [state.phase]);

  return (
    <>
      <div className={styles.component}>
        <ThreadView threadItems={state.threadItems} />
        <ErrorArea phase={state.phase} />
        <MockTTS phase={state.phase} />
        <ControlsArea
          onStartChat={handleStartChat}
          onStopChat={handleStopChat}
          onStartListening={handleStartListening}
          onSendUserMessage={handleSendUserMessage}
          onEndSession={handleEndSession}
          phase={state.phase}
        />
      </div>
      <div className={styles.status}>status: {state.phase.status}</div>
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
    abortControllerRef.current?.abort();
  }

  function handleStartListening() {
    startListening();
  }

  function handleEndSession() {
    dispatch({ type: 'END_SESSION' });
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

    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
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

    dispatch({ type: 'USER_MESSAGE_SENT', payload: { message: input } });
    abortControllerRef.current = new AbortController();
    const reply: AIChatResult = await sendChatMessage({
      input,
      previousInteractionId,
      systemInstruction,
      abortSignal: abortControllerRef.current.signal,
    });
    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
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
