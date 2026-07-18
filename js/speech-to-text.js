const output = document.getElementById("output");
const logWin = document.getElementById("log");
const language = "nl-NL";
// const language = "nb-NO";
// const language = "en-US";

let recognition;

init();

function init() {
  recognition = initRecognition();
  initUI();
  // addEventLogging();
}

function initRecognition() {
  const CrossBrowserSpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
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

// recognition event handlers

function handleStart() {
  log(
    `start - start listening - Ready to receive speech in ${recognition.lang}`,
  );
}

function handleAudioStart() {
  log("audio start - start capturing");
}

function handleSoundStart() {
  log("sound start - show soundwave");
}

function handleSpeechStart() {
  log("speech start - sound recognized as speech");
}

function handleResult(event) {
  const result = event.results[0][0].transcript;
  const p = document.createElement("p");
  p.textContent = result;
  output.appendChild(p);
}

function handleNoMatch() {
  log("no match - service returned result without recognition");
}

function handleError() {
  log("error - an error occurred");
}

function handleSpeechEnd() {
  log("speech end - no more speech detected");
}

function handleSoundEnd() {
  log("sound end - hide soundwave");
}

function handleAudioEnd() {
  log("audio end - stop capturing");
}

function handleEnd() {
  log("end - recognition service has disconnected");
}

function initUI() {
  const startBtn = document.getElementById("start-button");
  const stopBtn = document.getElementById("stop-button");
  const cancelBtn = document.getElementById("cancel-button");
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

function log(msg) {
  console.log(msg);
  const p = document.createElement("p");
  p.textContent = msg;
  logWin.appendChild(p);
}
