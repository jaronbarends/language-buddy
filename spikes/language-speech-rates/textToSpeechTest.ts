import { type LanguageVoice } from '@/lib/language';

const testMessages: Record<string, string> = {
  'nl-NL':
    'Het plan van wereldvoetbalbond FIFA om een belang in een nieuw WK-bedrijf te verkopen gaat niet door. FIFA-voorzitter Gianni Infantino bevestigt dat in een verklaring die de FIFA deelt op X. De beslissing volgt op een een wereldwijde golf van protesten.',
  'nb-NO':
    'Verdensfotballforbund FIFAs plan om å selge en eierandel i et nytt VM-selskap vil ikke bli gjennomført. FIFA-president Gianni Infantino bekreftet dette i en uttalelse delt av FIFA på X. Avgjørelsen følger en global bølge av protester.',
  'es-ES':
    'El plan de la FIFA, organismo rector del fútbol mundial, de vender una participación en la nueva empresa de la Copa Mundial no se llevará a cabo. El presidente de la FIFA, Gianni Infantino, lo confirmó en un comunicado difundido por la FIFA en X. La decisión se produce tras una ola de protestas a nivel mundial.',
  'fr-FR': `Le projet de la FIFA, instance dirigeante du football mondial, de vendre une participation dans une nouvelle société organisatrice de la Coupe du Monde est abandonné. Le président de la FIFA, Gianni Infantino, l'a confirmé dans un communiqué diffusé par la FIFA sur X. Cette décision fait suite à une vague de protestations à travers le monde.`,
  'en-US': `World football governing body FIFA's plan to sell a stake in a new World Cup company will not go ahead. FIFA President Gianni Infantino confirmed this in a statement shared by FIFA on X. The decision follows a global wave of protests.`,
  'de-DE': `Der Plan des Weltfußballverbandes FIFA, Anteile an einer neuen WM-Gesellschaft zu verkaufen, wird nicht umgesetzt. FIFA-Präsident Gianni Infantino bestätigte dies in einer von der FIFA auf X veröffentlichten Erklärung. Die Entscheidung folgt auf eine weltweite Protestwelle.`,
};

export function testSpeechRates(voice: LanguageVoice) {
  // const rates = [1, 2];
  const rates = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.6, 1.8, 2, 3, 4];
  let idx = 0;
  const findings: any = [];
  next();

  function next() {
    console.log(voice!.lang);
    const message: string = testMessages[voice!.lang];
    if (idx < rates.length) {
      const startMs = new Date().getTime();
      const rate = rates[idx];
      console.log('rate:', rate);
      speakMessageForTest(message, voice, () => endHandler(startMs, rate), rate);
    }
  }

  function endHandler(startMs: number, rate: number) {
    const endMs = new Date().getTime();
    const elapsed = Math.round((endMs - startMs) / 10) / 100;
    findings.push({
      rate,
      elapsed,
    });
    console.log(findings); // log everytime, sometimes iOs did not log when I did it in "else" in next()'s if statement
    idx++;
    next();
  }
}

export function speakMessageForTest(
  message: string,
  voice: LanguageVoice,
  onSpeechEnd: () => void,
  rate: number
) {
  if (!voice || !('speechSynthesis' in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  // const rate = BASE_RATE * getRateCorrection();
  const sanitizedMessage = sanitizeMessage(message);
  const sentences = divideIntoSentences(sanitizedMessage);

  sentences.forEach((sentence, i) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = voice;
    utterance.rate = rate;

    // every utterance has an end event, but speech is only ended when the
    // last utterance's end event fires
    if (i === sentences.length - 1) {
      // console.log('last');
      utterance.addEventListener('end', onSpeechEnd);
    } else {
      // console.log(`not last: ${i}, ${sentences.length}`);
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
  return message.split('.');
}
