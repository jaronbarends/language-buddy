export function initSpeech(
  onSuccess: (supportedLanguageVoices: SpeechSynthesisVoice[]) => void,
  onFail: () => void
) {
  if (!('speechSynthesis' in window)) {
    onFail();
    return;
  }
  // note that the window object has only one speechSynthesis object, so every
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    // Firefox has voices available immediately, and won't trigger event
    voiceschangedHandler();
  } else {
    synth.addEventListener('voiceschanged', voiceschangedHandler);
  }

  function voiceschangedHandler() {
    const voices = synth.getVoices();
    onSuccess(voices);
  }
}
