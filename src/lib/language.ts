export type Language = {
  name: string;
  languageTag: string; // BCP 47 language tag, e.g. "nb-NO" or "en"
  addition?: string;
};

export type LanguageVoice = SpeechSynthesisVoice | undefined;
export type SupportedLanguageVoices = Record<string, SpeechSynthesisVoice>;
