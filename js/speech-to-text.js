import CONSTANTS from './constants.js';
import { log } from './utils.js';
const language = CONSTANTS.language;

const output = document.getElementById('output');
const startBtn = document.getElementById('start-button');
const startBtnLabelDefault = startBtn.textContent;

let recognition;
init();

function init() {
  recognition = initRecognition();
  initUI();
  // addEventLogging();
}

function initRecognition() {
  const CrossBrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new CrossBrowserSpeechRecognition();

  recognition.continuous = false;
  recognition.lang = language;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = handleStart;
  recognition.onaudiostart = handleAudioStart;
  recognition.onsoundstart = handleSoundStart;
  recognition.onspeechstart = handleSpeechStart;

  recognition.onresult = handleResult;
  recognition.onnomatch = handleNoMatch;
  recognition.onerror = handleError;

  recognition.onspeechend = handleSpeechEnd;
  recognition.onsoundend = handleSoundEnd;
  recognition.onaudioend = handleAudioEnd;
  recognition.onend = handleEnd;

  return recognition;
}

function handleResult(event) {
  log('result');
  console.log(event);
  const result = event.results[0][0];
  const p = document.createElement('p');
  p.textContent = result.transcript;
  const span = document.createElement('span');
  span.textContent = `confidence: ${result.confidence.toFixed(2)}`;
  span.classList.add('confidence');
  p.appendChild(span);
  output.appendChild(p);
}

// recognition event handlers

function handleStart() {
  startBtn.classList.add('is-active');
  startBtn.textContent = `Listening for ${recognition.lang}`;
  log(`start - start listening - Ready to receive speech in ${recognition.lang}`);
}

function handleAudioStart() {
  log('audio start - start capturing');
}

function handleSoundStart() {
  log('sound start - show soundwave');
}

function handleSpeechStart() {
  log('speech start - sound recognized as speech');
}

function handleNoMatch() {
  log('no match - service returned result without recognition');
}

function handleError(error) {
  log(`An error occurred. Message: ${error.message}; Error: ${error.error}`);
  if (error.error === 'service-not-allowed') {
    log('On iOs, check Privacy & Security → Speech Recognition — is Safari toggled on there?');
  }
}

function handleSpeechEnd() {
  log('speech end - no more speech detected');
}

function handleSoundEnd() {
  log('sound end - hide soundwave');
}

function handleAudioEnd() {
  log('audio end - stop capturing');
}

function handleEnd() {
  startBtn.classList.remove('is-active');
  startBtn.textContent = startBtnLabelDefault;
  log('end - recognition service has disconnected');
}

function initUI() {
  const stopBtn = document.getElementById('stop-button');
  const cancelBtn = document.getElementById('cancel-button');
  startBtn.onclick = () => {
    recognition.start();
  };

  stopBtn.onclick = () => {
    // stop recognition and try to return SpeechRecognitionResult
    recognition.stop();
  };

  cancelBtn.onclick = () => {
    // stop recognition without trying to return SpeechRecognitionResult
    recognition.abort();
  };
}
