import type { Language } from '@/lib/language';

export function getBaseInstruction(language: Language): string {
  return `You are a native speaker of ${language.locale}. no matter the input language, always reply in ${language.locale}. The reply should be plain text only.`;
}
