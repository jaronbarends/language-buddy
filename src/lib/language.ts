export type Language = {
  name: string;
  languageTag: string; // BCP 47 language tag, e.g. "nb-NO" or "en"
  addition?: string;
  initiallySelected?: boolean;
};

export type LanguageVoice = SpeechSynthesisVoice | undefined;
export type SupportedLanguageVoices = Record<string, SpeechSynthesisVoice>;

export type LanguageLevelName = 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper intermediate';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type LanguageLevel = {
  name: LanguageLevelName;
  cefrLevel: CEFRLevel;
};

export const languageLevels = [
  { name: 'Beginner', cefrLevel: 'A1' },
  { name: 'Elementary', cefrLevel: 'A2' },
  { name: 'Intermediate', cefrLevel: 'B1' },
  { name: 'Upper intermediate', cefrLevel: 'B2' },
] as const satisfies readonly LanguageLevel[];

export function getLanguageLevelByName(name: LanguageLevelName): LanguageLevel {
  const level = languageLevels.find((l) => l.name === name);
  // fallback; should never happen
  return level || languageLevels[0];
}
