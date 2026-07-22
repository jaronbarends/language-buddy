import CONSTANTS from './constants.js';
import { log } from './utils.js';
const language = CONSTANTS.language;

const output = document.getElementById('output');
const startBtn = document.getElementById('start-button');
const startBtnLabel = document.getElementById('start-button-label');
const startBtnLabelTextDefault = startBtnLabel.textContent;
const countdownElm = document.getElementById('countdown');
let recognitionShouldBeActive = false;
let countdownInterval;
const MAX_DURATION_SEC = 15;

let recognition;
init();

function init() {
  recognition = initRecognition();
  initUI();
}

function initRecognition() {
  const CrossBrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new CrossBrowserSpeechRecognition();

  recognition.continuous = true;
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
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    if (!result.isFinal) continue; // not necessary when interimResults=false, but keep it in case we change that

    renderResult(result[0]);
  }
}

function renderResult(result) {
  const p = document.createElement('p');
  const transcriptSpan = document.createElement('span');
  const confidenceSpan = document.createElement('span');
  const transcript = result.transcript;
  if (!transcript) {
    // when you say only one short word, it gives empty transcript.
    return;
  }
  transcriptSpan.textContent = transcript;
  transcriptSpan.classList.add('transcript');
  p.appendChild(transcriptSpan);
  confidenceSpan.textContent = `confidence: ${result.confidence.toFixed(2)}`;
  confidenceSpan.classList.add('confidence');
  p.appendChild(confidenceSpan);
  output.appendChild(p);
}

// recognition event handlers

function handleStart() {
  log(`start - start listening`);
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
  if (recognitionShouldBeActive) {
    log('prevent end');
    recognition.start(); // end was triggered by silence timeout, not wanted
  } else {
    startBtn.classList.remove('is-active');
    startBtnLabel.textContent = startBtnLabelTextDefault;
    log('end - recognition service has disconnected');
  }
}

function initUI() {
  const stopBtn = document.getElementById('stop-button');
  const cancelBtn = document.getElementById('cancel-button');
  const clearBtn = document.getElementById('clear-button');
  startBtn.onclick = handleStartFromUI;

  stopBtn.onclick = handleStopRequest;

  cancelBtn.onclick = () => {
    // stop recognition without trying to return SpeechRecognitionResult
    recognition.abort();
  };

  clearBtn.onclick = () => {
    output.innerHTML = '';
  };
}

function handleStartFromUI() {
  recognitionShouldBeActive = true;
  startBtn.classList.add('is-active');
  startBtnLabel.textContent = `Listening for ${recognition.lang}`;
  recognition.start();
  // maxDurationTimer = setTimeout(handleStopRequest, 1000 * MAX_DURATION_SEC);
  startCountdown();
}

function startCountdown() {
  let timeRemaining = 1000 * MAX_DURATION_SEC;
  countdownElm.textContent = Math.round(timeRemaining / 1000);

  countdownInterval = setInterval(() => {
    timeRemaining -= 1000;
    countdownElm.textContent = Math.round(timeRemaining / 1000);
    if (timeRemaining <= 0) {
      clearInterval(countdownInterval);
      handleStopRequest();
    }
  }, 1000);
}

function handleStopRequest() {
  // stop recognition and try to return SpeechRecognitionResult
  recognitionShouldBeActive = false;
  recognition.stop();
  countdownElm.textContent = '';
}
