// nb_NO
// nn_NO

const language = "nb"; // bokmål
let speechIsDisabled = false;
let synth = null;
let voice = null;

initSpeech();

function initSpeech() {
  if (!("speechSynthesis" in window)) {
    speechIsDisabled = true;
    return null;
  }

  // note that the window object has only one speechSynthesis object, so every
  synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) {
    // Firefox has voices available immediately, and won't trigger event
    voiceschangedHandler();
  } else {
    synth.addEventListener("voiceschanged", voiceschangedHandler, {
      once: true,
    });
  }
}

function voiceschangedHandler() {
  console.log("voiceschanged");
  const v = getVoiceForLanguage();
  if (!v) {
    console.log("no v");
    speechIsDisabled = true;
    return;
  }

  voice = v;
  console.log(v);
  speechIsDisabled = false;
}

function getVoiceForLanguage() {
  const voices = synth.getVoices();
  console.log("voices:", voices);
  // if we ever add language that has mulitple variants (like 'nl-NL', 'nl-BE') we need to set preference order
  // does not apply to Norwegian, since there we have to different languages ('nb_NO' and 'nn_NO')
  return voices.find((v) => v.lang.startsWith(language));
}
