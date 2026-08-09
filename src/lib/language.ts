export type Language = {
  name: string;
  languageTag: string; // BCP 47 language tag, e.g. "nb-NO" or "en"
  addition?: string;
  initiallySelected?: boolean;
};

export type LanguageVoice = SpeechSynthesisVoice | undefined;
export type SupportedLanguageVoices = Record<string, SpeechSynthesisVoice>;

export type LanguageLevelName = 'Beginner' | 'Intermediate';
export type LanguageLevel = {
  name: LanguageLevelName;
  cefrLevel: string;
};

export const languageLevels: LanguageLevel[] = [
  { name: 'Beginner', cefrLevel: 'A1/A2' },
  { name: 'Intermediate', cefrLevel: 'B1/B2' },
];

export function getLanguageLevelByName(name: LanguageLevelName): LanguageLevel {
  const level = languageLevels.find((l) => l.name === name);
  return level || languageLevels[0];
}
