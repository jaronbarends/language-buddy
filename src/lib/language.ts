export type Language = {
  name: string;
  languageTag: string; // BCP 47 language tag, e.g. "nb-NO" or "en"
};

export type LanguageVoice = SpeechSynthesisVoice | undefined;
