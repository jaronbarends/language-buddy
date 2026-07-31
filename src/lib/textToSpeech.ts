import { type LanguageVoice } from '@/lib/language';
import { isIOS } from '@/lib/platform';

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

const BASE_RATE = 1.5;
// const BASE_RATE = 1.2;
// how speech rate is interpreted differs per platform
const SPEECH_RATE_CORRECTION_BY_PLATFORM = {
  ios: 0.65,
  // ios: 1,
  default: 1,
} as const;

export function speakMessage(message: string, voice: LanguageVoice, onSpeechEnd: () => void) {
  if (!voice || !('speechSynthesis' in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  const rate = BASE_RATE * getRateCorrection();
  const sanitizedMessage = sanitizeMessage(message);
  const sentences = divideIntoSentences(sanitizedMessage);

  sentences.forEach((sentence, i) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = voice;
    utterance.rate = rate;

    // every utterance has an end event, but speech is only ended when the
    // last utterance's end event fires
    if (i === sentences.length - 1) {
      utterance.addEventListener('end', onSpeechEnd);
    }
    synth.speak(utterance);
  });
}

function getRateCorrection(): number {
  if (isIOS()) {
    return SPEECH_RATE_CORRECTION_BY_PLATFORM.ios;
  }
  return SPEECH_RATE_CORRECTION_BY_PLATFORM.default;
}

function sanitizeMessage(rawMessage: string) {
  const sanitizedMessage = rawMessage.replace(/\s+/g, ' ').trim();
  // If message contains white space (\n, tabs), that will be interpreted by voice on Chrome as cues for a pause. Remove them.
  return sanitizedMessage;
}

function divideIntoSentences(message: string): string[] {
  // Chrome will only play short utterances (max 200-300 words). Divide long text into sentences,
  // so text remains short. SpeechSynthesis leaves a small pause between utterances, so sentences
  // is a good way to split up text
  return message.split('.');
}
