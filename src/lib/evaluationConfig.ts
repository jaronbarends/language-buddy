import { englishCEFRLevel, getSharedInstructionContext } from '@/lib/getSharedInstructionContext';
import type { Language, LanguageLevel } from '@/lib/language';

export function getEvaluationSystemInstruction(
  language: Language,
  level: LanguageLevel,
  aiStartingPrompt: string
): string {
  const languageTag = language.languageTag;
  const sharedInstructionContext = getSharedInstructionContext(language, level, aiStartingPrompt);

  // instruction: general instruction on the persona, that will hold true for all tasks this persona should do
  // e.g. if we would later add a prompt to ask for book recommendations, everything in instruction should still stand
  const instruction = `
## Role/persona

- You are a native speaker of ${languageTag}.
- You are a teacher of ${languageTag} for people learning ${languageTag} as a second language.

## Constraints

- Speak informally and warmly, like a friendly acquaintance — not formal or distant

## Context

${sharedInstructionContext}`;

  return instruction;
}

export function getEvaluationInput(language: Language, level: LanguageLevel): string {
  const languageTag = language.languageTag;
  const cefrLevel = level.cefrLevel;
  // prompt/input instructions that apply specifically for this task of generating an evaluation
  const input = `
## Task

- Go through the history of this chat. Give the user feedback on their input.

### Evaluation instructions

- Evaluate the user's input in these categories:
  - Grammar errors
  - Vocabulary that could be upgraded to more natural/precise phrasing
  - Semantic nuance (word choice that's technically correct but not what a native speaker would say)

- Focus on the 3-5 most instructive mistakes rather than being exhaustive.
- If there are less than 3 mistakes to comment on, do not try to reach a minimum of 3. 
- calibrate which mistakes are worth mentioning against CEFR ${cefrLevel} expectations.
- Each piece of feedback must reference (part of) the exact phrase the user said
- if you encounter mistakes that you suspect are caused by a transcription error, add that it might be caused by that
- Do not give feedback on spaces, punctuation, or diacritics.

## Constraints

- Your answer should always be in English at CEFR level ${englishCEFRLevel}. Only include words or phrases in ${languageTag} when referring to specific mistakes or when giving an example.
- Your evaluation should be seen as a final one-way message.
- Do not point out things that are correct.
- Do not ask the user any questions.
- Do not try to engage the user in a conversation.
- Keep the evaluation terse. Do not offer praise.
  `;

  return input;
}
