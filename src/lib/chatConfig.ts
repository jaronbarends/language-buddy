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
  const baseInstruction = getBaseInstruction(language);
  const systemInstruction = `${baseInstruction} ${scenario.instruction}`;

  return {
    language,
    systemInstruction,
    aiHasFirstTurn: scenario.aiHasFirstTurn,
  };
}
