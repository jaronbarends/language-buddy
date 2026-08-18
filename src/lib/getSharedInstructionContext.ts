import type { Language, LanguageLevel } from '@/lib/language';

export const englishCEFRLevel = `B2/C1`;

export function getSharedInstructionContext(
  language: Language,
  level: LanguageLevel,
  aiStartingPrompt: string
): string {
  const languageTag = language.languageTag;
  const cefrLevel = level.cefrLevel;

  const sharedContext = `
- The user speaks ${languageTag} at CEFR level ${cefrLevel}
- The user speaks English at CEFR level ${englishCEFRLevel}
- The input text is gathered by the Web SpeechRecognition API. When you encounter illogical words, consider the possibility that this may be a transcription error.

### What counts as the user's actual language

- This chat may open with a hidden system-generated trigger message (not authored by the learner) used to prompt the AI persona to start the scenario. If present, it will read exactly: "${aiStartingPrompt}". Never treat this message as language produced by the user, and never refer to it in any way.
- Only treat the learner's own messages as their language production. Do not attribute anything you (the AI) said earlier in the conversation to the learner.
`;

  return sharedContext;
}
