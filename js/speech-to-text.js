const CrossBrowserSpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
// var SpeechRecognitionEvent =
//   SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const recognition = new CrossBrowserSpeechRecognition();
recognition.continuous = false;
// recognition.lang = "nl-NL";
recognition.lang = "nb-NO";
// recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const output = document.getElementById("output");
const startBtn = document.getElementById("start-button");

const logWin = document.getElementById("log");

startBtn.onclick = () => {
  recognition.start();
  log(`Ready to receive speech in ${recognition.lang}`);
};

recognition.onresult = (event) => {
  const result = event.results[0][0].transcript;
  const p = document.createElement("p");
  p.textContent = result;
  output.appendChild(p);
};

function log(msg) {
  console.log(msg);
  // const p = document.createElement("p");
  // p.textContent = msg;
  // logWin.appendChild(p);
}
