import { log } from './utils.js';
import CONSTANTS from './constants.js';
const language = CONSTANTS.language; // nb_NO

let speechIsDisabled = false;
let synth = null;
let voice = null;
let isPaused = false;
let noVoiceFeedbackTimer;

init();

function init() {
  initSpeech();
  initUI();
}

function initSpeech() {
  if (!('speechSynthesis' in window)) {
    speechIsDisabled = true;
    return null;
  }

  // note that the window object has only one speechSynthesis object, so every
  synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    // Firefox has voices available immediately, and won't trigger event
    voiceschangedHandler();
  } else {
    synth.addEventListener('voiceschanged', voiceschangedHandler);
  }
}

function voiceschangedHandler() {
  const v = getVoiceForLanguage();
  if (!v) {
    console.log('no voice found - set timeout for warning');
    // Chrome builds its voice list asynchronously and can fire voiceschanged more than once as different sources populate. It may not contain the right language right away - especially the first time after Chrome fired up
    noVoiceFeedbackTimer = setTimeout(() => {
      log(`⚠️no voice found for ${language}`);
      speechIsDisabled = true;
    }, 250);
    return;
  }

  clearTimeout(noVoiceFeedbackTimer);
  synth.removeEventListener('voiceschanged', voiceschangedHandler);
  log(`✅ voice found for ${language}`);
  voice = v;
  speechIsDisabled = false;
}

function getVoiceForLanguage() {
  const voices = synth.getVoices();
  return voices.find((v) => v.lang === language);
}

function initUI() {
  const startBtn = document.getElementById('read-button');
  startBtn.addEventListener('click', handleToggle);
}

function handleToggle() {
  if (synth.speaking) {
    // synth is in speaking mode. speaking is confusing term here: it means it's either busy speaking or paused
    toggleSpeech();
  } else {
    startSpeech();
  }
}

function toggleSpeech() {
  if (isPaused) {
    synth.resume();
    isPaused = false;
  } else {
    synth.pause();
    isPaused = true;
  }
}

function startSpeech() {
  const rawText = document.getElementById('text-source').textContent.replace(/\s+/g, ' ').trim();
  // because we're using text from a div, any white space in code (\n, tabs) are preserved. Those spaces are interpreted by voice on Chrome as cues for a pause. Remove them. This probably won't be necessary in final project, but good to add anyway - just to be sure

  // Chrome will only play short utterances (max 200 - 300 words). Divide long text into sentences, so text remains short. SpeechSynthesis leaves a small pause between utterances, so sentences is a good way to split up text
  const sentences = rawText.split('.');
  console.log(sentences);

  sentences.forEach((sentence, i) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = voice;
    // much difference between chrome and safari. 1.4 is fine in chrome, but way to fast in safari.
    utterance.rate = 1.1;

    // every utterance has an end event, but speech is only ended when the
    // last utterance's end event fires
    if (i === sentences.length - 1) {
      utterance.addEventListener('end', handleSpeechEnd);
    }
    synth.speak(utterance);
  });
}

function handleSpeechEnd() {
  console.log('Done talking');
}
