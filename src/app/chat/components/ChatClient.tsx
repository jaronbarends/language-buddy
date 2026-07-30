'use client';

import { useReducer, useState, useRef, useEffect } from 'react';

import { chatReducer, type ChatState } from '@/app/chat/chatReducer';
import ControlsArea from '@/app/chat/components/ControlsArea';
import ErrorArea from '@/app/chat/components/ErrorArea';
import SpeechToText from '@/app/chat/components/SpeechToText';
import ThreadView from '@/app/chat/components/ThreadView';
import { sendChatMessage, type AIChatResult } from '@/lib/aiService';
import { type ChatConfig } from '@/lib/chatConfig';

import styles from './ChatClient.module.css';

type ChatClientProps = {
  chatConfig: ChatConfig;
};

export default function ChatClient({ chatConfig }: ChatClientProps) {
  const { aiHasFirstTurn, systemInstruction, language } = chatConfig;
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
        <SpeechToText
          phase={state.phase}
          onTranscriptCreated={handleTranscriptCreated}
          onError={handleError}
          languageTag={language.languageTag}
        />
        <ControlsArea
          onStartChat={handleStartChat}
          onStopChat={handleStopChat}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
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

  function handleStopListening() {
    dispatch({ type: 'STOP_LISTENING' });
  }

  function handleEndSession() {
    dispatch({ type: 'END_SESSION' });
  }

  function handleTranscriptCreated(transcript: string) {
    if (transcript === '') {
      dispatch({ type: 'TRANSCRIPT_EMPTY' });
    }
    dispatch({ type: 'TRANSCRIPT_CREATED', payload: { transcript } });
  }

  function handleError() {
    // TODO decide how to handle non-api errors
  }

  async function startChatWithAI() {
    abortControllerRef.current = new AbortController();
    const input = 'start the conversation according to the system instructions';

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
    dispatch({ type: 'START_CHAT_WITH_USER' });
  }

  function startListening() {
    dispatch({ type: 'START_LISTENING' });
  }

  async function handleSendUserMessage() {
    if (state.phase.status !== 'readyForSendingUserReply') {
      return;
    }
    const input = state.phase.transcript;

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
