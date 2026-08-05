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
  const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return Constructor;
}
