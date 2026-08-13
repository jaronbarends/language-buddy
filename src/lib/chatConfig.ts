import { getBaseInstruction } from '@/lib/getBaseInstruction';
import type { Language, LanguageLevel } from '@/lib/language';
import type { Scenario, Starter } from '@/lib/scenarios';

import { getEvaluationSystemInstruction, getEvaluationInput } from './evaluationConfig';

export type ChatConfig = {
  language: Language;
  systemInstruction: string;
  evaluationSystemInstruction: string;
  evaluationInput: string;
  starter: Starter;
};

export function getChatConfig(
  language: Language,
  languageLevel: LanguageLevel,
  scenario: Scenario
): ChatConfig {
  if (!isValidLanguageTag(language.languageTag)) {
    throw new Error(
      `Language tag ${language.languageTag} is not valid. Should look like 'en' or 'en-US'`
    );
  }
  const baseInstruction = getBaseInstruction(language, languageLevel);
  const systemInstruction = `${baseInstruction.prefix} ${scenario.instruction} ${baseInstruction.suffix}`;
  const evaluationSystemInstruction = getEvaluationSystemInstruction(language, languageLevel);
  const evaluationInput = getEvaluationInput(language, languageLevel);

  return {
    language,
    systemInstruction,
    evaluationSystemInstruction,
    evaluationInput,
    starter: scenario.starter,
  };
}

function isValidLanguageTag(languageTag: string) {
  // regex simplified for my use case. 2 lowercase letters, optionally followed by dash + 2 uppercase letters. Mostly to catch use of underscore.
  if (typeof languageTag !== 'string') {
    // regex.test calls String() on its argument, possibly leading to unexpected results (e.g. when languageTag is undefined)
    return false;
  }
  const regex = /^[a-z]{2}(?:-[A-Z]{2})?$/;
  return regex.test(languageTag);
}
