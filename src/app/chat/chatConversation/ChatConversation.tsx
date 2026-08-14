'use client';
import { useReducer, useState, useRef, useEffect } from 'react';

import { AIError, sendChatMessage, type AIChatResult } from '@/lib/aiService';
import { type ChatConfig } from '@/lib/chatConfig';
import { type LanguageVoice } from '@/lib/language';

import {
  shouldSendReply,
  chatReducer,
  chatStartIsPending,
  requestsShouldBeAborted,
  sessionShouldEnd,
  shouldRequestEvaluation,
  type ChatState,
} from './chatReducer';
import ControlsArea from './components/ControlsArea';
import DevHelper from './components/DevHelper';
import ErrorArea from './components/ErrorArea';
import SpeechToText from './components/SpeechToText';
import ThreadView from './components/ThreadView';

import styles from './ChatConversation.module.css';

type ChatConversationProps = {
  chatConfig: ChatConfig;
  languageVoice: LanguageVoice;
  openingHint: string | undefined;
  onEndSession: () => void;
};

export default function ChatConversation({
  chatConfig,
  languageVoice,
  openingHint,
  onEndSession,
}: ChatConversationProps) {
  const [previousInteractionId, setPreviousInteractionId] = useState<string | undefined>();
  const initalChatState: ChatState = { threadItems: [], phase: { status: 'chatStartPending' } };
  const [state, dispatch] = useReducer(chatReducer, initalChatState);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const hasStartedRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const startChatRef = useRef<() => void>(() => {});

  // Keep up to date via this effect (not useCallback) so startChat always uses
  // the latest chatConfig/startChatWithAI/startChatWithUser. We don't want those as
  // dependencies in the useEffect that calls startChatRef.current below, because
  // them changing mid-session shouldn't re-trigger chat start.
  useEffect(() => {
    startChatRef.current = () => {
      if (chatConfig.starter === 'ai') {
        startChatWithAI();
      } else {
        startChatWithUser();
      }
    };
    // deliberately leave out dependency array - we want this to run on every render to stay current
  });

  useEffect(() => {
    if (!chatStartIsPending(state.phase) || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    startChatRef.current();
  }, [state.phase]);

  useEffect(() => {
    if (shouldSendReply(state.phase)) {
      sendUserMessage();
    }
  });

  useEffect(() => {
    if (shouldRequestEvaluation(state.phase)) {
      sendEvaluationRequest();
    }
  });

  useEffect(() => {
    if (requestsShouldBeAborted(state.phase)) {
      requestIdRef.current++;
      abortControllerRef.current?.abort();
    }
  }, [state.phase]);

  useEffect(() => {
    if (sessionShouldEnd(state.phase)) {
      onEndSession();
    }
  });

  return (
    <>
      <div className={styles.chatConversation}>
        <ThreadView
          phase={state.phase}
          threadItems={state.threadItems}
          languageVoice={languageVoice}
          openingHint={openingHint}
          onAISpeechEnd={handleAISpeechEnd}
        />
        <ErrorArea phase={state.phase} />
        <SpeechToText
          phase={state.phase}
          onTranscriptCreated={handleTranscriptCreated}
          onListeningCancelled={handleListeningCancelled}
          languageTag={chatConfig.language.languageTag}
        />
        <ControlsArea
          onStartListening={handleStartListening}
          onSendRequested={handleSendRequested}
          onCancelListening={handleCancelListening}
          onEvaluationRequested={handleEvaluationRequest}
          onEndSessionRequested={handleEndSessionRequest}
          phase={state.phase}
        />
      </div>
      {process.env.NEXT_PUBLIC_SHOW_DEV_HELPER && (
        <DevHelper phase={state.phase} language={chatConfig.language} />
      )}
    </>
  );

  function handleStartListening() {
    startListening();
  }

  function handleSendRequested() {
    dispatch({ type: 'STOP_LISTENING', payload: { intent: 'send' } });
  }

  function handleTranscriptCreated(transcript: string) {
    if (transcript === '') {
      dispatch({ type: 'TRANSCRIPT_EMPTY' });
      return;
    }
    dispatch({ type: 'TRANSCRIPT_CREATED', payload: { transcript } });
  }

  function handleCancelListening() {
    dispatch({ type: 'CANCEL_LISTENING' });
  }

  function handleListeningCancelled() {
    dispatch({ type: 'LISTENING_CANCELLED' });
  }

  async function startChatWithAI() {
    const input = 'start the conversation according to the system instructions';
    dispatch({ type: 'AI_START_INPUT_SENT' });

    await sendMessageToAI(input);
  }

  function startChatWithUser() {
    dispatch({ type: 'START_CHAT_WITH_USER' });
  }

  function startListening() {
    dispatch({ type: 'START_LISTENING' });
  }

  async function sendUserMessage() {
    if (!shouldSendReply(state.phase)) {
      return;
    }

    const input = state.phase.transcript;
    dispatch({ type: 'USER_MESSAGE_SENT', payload: { message: input } });

    await sendMessageToAI(input);
  }

  async function sendEvaluationRequest() {
    if (!shouldRequestEvaluation(state.phase)) {
      return;
    }

    dispatch({ type: 'EVALUATION_REQUEST_SENT' });

    await sendEvaluationRequestToAI();
  }

  function handleAISpeechEnd() {
    dispatch({ type: 'AI_FINISHED_SPEAKING' });
  }

  function handleEvaluationRequest() {
    dispatch({ type: 'REQUEST_EVALUATION' });
  }

  function handleEndSessionRequest() {
    dispatch({ type: 'END_SESSION' });
  }

  async function sendMessageToAI_OLD(input: string): Promise<void> {
    let reply: AIChatResult;
    abortControllerRef.current = new AbortController();
    requestIdRef.current++;
    const requestId = requestIdRef.current;

    try {
      reply = await sendChatMessage({
        input,
        previousInteractionId,
        systemInstruction: chatConfig.systemInstruction,
        abortSignal: abortControllerRef.current.signal,
      });
      if (requestIsStale(requestId)) {
        return;
      }
    } catch (error) {
      if (requestIsStale(requestId)) {
        return;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return; // user cancelled, not a real error, don't dispatch
      }
      dispatch({ type: 'ERROR', payload: { error: error as AIError } });
      return;
    }

    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
      return;
    }

    setPreviousInteractionId(reply.interactionId);
    dispatch({ type: 'AI_RESPONSE_RECEIVED', payload: { message: reply.message } });
  }

  async function sendMessageToAI(input: string): Promise<void> {
    const reply: AIChatResult | undefined = await sendToAI(input, chatConfig.systemInstruction);

    if (reply === undefined) {
      // handled in sendToAI
      return;
    }

    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
      return;
    }

    setPreviousInteractionId(reply.interactionId);
    dispatch({ type: 'AI_RESPONSE_RECEIVED', payload: { message: reply.message } });
  }

  async function sendEvaluationRequestToAI() {
    const reply: AIChatResult | undefined = await sendToAI(
      chatConfig.evaluationInput,
      chatConfig.evaluationSystemInstruction
    );

    if (reply === undefined) {
      // handled in sendToAI
      return;
    }

    if (!reply.success) {
      // then reply must be error object
      dispatch({ type: 'ERROR', payload: { error: reply } });
      return;
    }

    dispatch({ type: 'EVALUATION_RECEIVED', payload: { evaluation: reply.message } });
  }

  async function sendToAI(
    input: string,
    systemInstruction: string
  ): Promise<AIChatResult | undefined> {
    let reply: AIChatResult;
    abortControllerRef.current = new AbortController();
    requestIdRef.current++;
    const requestId = requestIdRef.current;

    try {
      reply = await sendChatMessage({
        input,
        previousInteractionId,
        systemInstruction,
        abortSignal: abortControllerRef.current.signal,
      });
      if (requestIsStale(requestId)) {
        return;
      }
    } catch (error) {
      if (requestIsStale(requestId)) {
        return;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return; // user cancelled, not a real error, don't dispatch
      }
      dispatch({ type: 'ERROR', payload: { error: error as AIError } });
      return;
    }

    return reply;
  }

  function requestIsStale(requestId: number): boolean {
    return requestId !== requestIdRef.current;
  }
}
