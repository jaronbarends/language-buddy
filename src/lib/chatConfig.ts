// src/lib/chatConfig.ts
import { getBaseInstruction } from '@/lib/getBaseInstruction';
import type { Language } from '@/lib/language';
import type { Scenario } from '@/lib/scenarios';

export type ChatConfig = {
  language: Language;
  systemInstruction: string;
  aiHasFirstTurn: boolean;
};

export function getChatConfig(language: Language, scenario: Scenario): ChatConfig {
  if (!isValidLanguageTag(language.languageTag)) {
    throw new Error(
      `Language tag ${language.languageTag} is not valid. Should look like 'en' or 'en-US'`
    );
  }
  const baseInstruction = getBaseInstruction(language);
  const systemInstruction = `${baseInstruction} ${scenario.instruction}`;

  return {
    language,
    systemInstruction,
    aiHasFirstTurn: scenario.aiHasFirstTurn,
  };
}

function isValidLanguageTag(languageTag: string) {
  // regex simplified for my use case. 2 lowercase letters, optionally followed by dash + 2 uppercase letters. Mostly to catch use of underscore.
  const regex = /[a-z]{2}(?:-[A-Z]{2})?/;
  return regex.test(languageTag);
}
