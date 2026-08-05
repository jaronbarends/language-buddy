import { useSyncExternalStore } from 'react';

export function speechRecognitionIsSupported(): boolean {
  const Constructor = getConstructor();
  return Boolean(Constructor);
}

export function getCrossBrowserSpeechRecognition(): SpeechRecognition | undefined {
  const Constructor = getConstructor();
  if (!Constructor) {
    return undefined;
  }
  return new Constructor();
}

function getConstructor(): typeof SpeechRecognition | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return Constructor;
}

function subscribe(): () => void {
  // browser support never changes during a session — no real events to subscribe to
  return () => {};
}

function getServerSnapshot(): boolean {
  return false;
}

export function useSpeechRecognitionIsSupported(): boolean {
  return useSyncExternalStore(subscribe, speechRecognitionIsSupported, getServerSnapshot);
}
