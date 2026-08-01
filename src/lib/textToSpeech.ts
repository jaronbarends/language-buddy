import { type LanguageVoice } from '@/lib/language';

export function initSpeech(
  onSuccess: (supportedLanguageVoices: SpeechSynthesisVoice[]) => void,
  onFail: () => void
) {
  console.log('initSpeech');
  if (!('speechSynthesis' in window)) {
    console.log('initSpeech - call onFail');
    onFail();
    return;
  }
  // note that the window object has only one speechSynthesis object
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    // Firefox has voices available immediately, and won't trigger event
    voiceschangedHandler();
  } else {
    synth.addEventListener('voiceschanged', voiceschangedHandler);
  }

  function voiceschangedHandler() {
    const voices = synth.getVoices();
    console.log('voices:', voices);
    onSuccess(voices);
  }
}

const GOOGLE_SPEECH_RATE = 1;

export function speakMessage(message: string, voice: LanguageVoice, onSpeechEnd: () => void) {
  console.log('speakMessage');
  if (!voice || !('speechSynthesis' in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  const rate = googleRateToEngineRate(GOOGLE_SPEECH_RATE, voice);
  const sanitizedMessage = sanitizeMessage(message);
  const sentences = divideIntoSentences(sanitizedMessage);

  console.log('sentences:', sentences);

  if (sentences.length === 0) {
    // nothing to speak (e.g. empty message) - signal completion immediately
    // rather than leaving the caller waiting on a callback that never fires
    onSpeechEnd();
    return;
  }

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

function sanitizeMessage(rawMessage: string) {
  const sanitizedMessage = rawMessage.replace(/\s+/g, ' ').trim();
  // If message contains white space (\n, tabs), that will be interpreted by voice on Chrome as cues for a pause. Remove them.
  return sanitizedMessage;
}

function divideIntoSentences(message: string): string[] {
  // Chrome will only play short utterances (max 200-300 words). Divide long text into sentences,
  // so text remains short. SpeechSynthesis leaves a small pause between utterances, so sentences
  // is a good way to split up text
  const sentences = message.split('.');
  return sentences.map((s) => s.trim()).filter((s) => s !== '');
}

type VoiceEngine = 'google' | 'apple' | 'microsoft';

// speech rate steps are 0.05 apart; snap to the nearest step before lookup so
// float drift (e.g. a rate computed as stepIndex * 0.05) doesn't miss an
// otherwise-matching entry in speechRatePairings
const RATE_STEP = 0.05;

function roundToRateStep(rate: number): number {
  return Math.round(rate / RATE_STEP) * RATE_STEP;
}

function googleRateToEngineRate(googleRate: number, voice: SpeechSynthesisVoice): number {
  const engine: VoiceEngine = getVoiceEngine(voice);
  const roundedRate = roundToRateStep(googleRate);
  const pairing = speechRatePairings.find((p) => p.google === roundedRate);
  if (!pairing) {
    if (roundedRate === 1) {
      // unlikely fallback where rate 1 is removed from pairings
      return 1;
    }
    console.warn(
      `no rate found for ${googleRate}. Provide a value between 0.8 and 1.3, in steps of 0.05. Using rate = 1 as google rate instead`
    );
    const fallbackPairing = speechRatePairings.find((p) => p.google === 1);
    return fallbackPairing?.[engine] ?? 1;
  }
  return pairing[engine];
}

function getVoiceEngine(voice: SpeechSynthesisVoice): VoiceEngine {
  const voiceURI = voice.voiceURI.toLowerCase();
  if (voiceURI.startsWith('apple')) {
    return 'apple';
  } else if (voiceURI.startsWith('microsoft')) {
    return 'microsoft';
  }
  console.warn(`No match found for ${voice.voiceURI}. Using default google instead.`);
  return 'google';
}

// speech rate implementation varies wildly between different voice engines. normalize based on
// google's rates, which are the most linear, and which also read intuitively as "slower/faster
// than normal" relative to 1
const speechRatePairings = [
  { google: 0.8, apple: 0.3, microsoft: 0.36 },
  { google: 0.85, apple: 0.32, microsoft: 0.39 },
  { google: 0.9, apple: 0.41, microsoft: 0.53 },
  { google: 0.95, apple: 0.48, microsoft: 0.58 },
  { google: 1.0, apple: 0.66, microsoft: 0.64 },
  { google: 1.05, apple: 0.73, microsoft: 0.69 },
  { google: 1.1, apple: 0.8, microsoft: 0.74 },
  { google: 1.15, apple: 0.96, microsoft: 0.79 },
  { google: 1.2, apple: 1.01, microsoft: 1.25 },
  { google: 1.25, apple: 1.04, microsoft: 1.4 },
  { google: 1.3, apple: 1.06, microsoft: 1.52 },
];
