import { type CEFRLevel } from '@/lib/language';

export type LevelInstructions = {
  constraints: string;
  styleReference: string;
};

const levelInstructionsByCefrLevel: Record<CEFRLevel, LevelInstructions> = {
  A1: {
    constraints: `
- One clause per sentence only. No subordinate or relative clauses, no conjunctions 
  like "because," "while," "although," "in order to." Two simple sentences joined 
  with "and" is fine.
- Max 6-8 words per sentence.
- Max 2-3 sentences per reply.
- Basic, high-frequency vocabulary only: everyday words for numbers, family, food, 
  time, common actions. Avoid idiomatic or abstract words.
- Ask at most one question per turn, using the same simple sentence structure.
`,
    styleReference: `
Match this sentence style and complexity exactly (English example, apply the same 
structure in the target language):

"Hello. My name is Anna. I am 25 years old. I live in a small house in London. 
I am a teacher. Every day, I get up at seven o'clock. I eat bread and drink tea 
for breakfast. At eight o'clock, I go to work by bus. I like my job because the 
children are nice."
`,
  },

  A2: {
    constraints: `
- Simple sentences, with occasional basic connectors allowed: "and," "but," "or," 
  "because," "so." No other subordination.
- Simple past and simple future are fine alongside present tense.
- Max 8-10 words per sentence.
- Max 3 sentences per reply.
- Everyday vocabulary, slightly broader than A1 — common objects, routines, simple 
  feelings ("happy," "tired," "busy"). Avoid abstract or opinion vocabulary.
- Ask at most one question per turn, using the same simple sentence structure.
`,
    styleReference: `
Match this sentence style and complexity (English example, apply the same 
structure in the target language):

"Yesterday I went to the market because I needed some vegetables. It was quite 
busy, but I found a good stall. I bought tomatoes, onions, and some bread. Then 
I walked home and cooked dinner. After dinner, I watched a movie with my sister."
`,
  },

  B1: {
    constraints: `
- Subordinate clauses are fine, but keep them simple and common ("because," "when," 
  "if," "so that"). Avoid stacking more than one subordinate clause per sentence.
- Vocabulary can go beyond the most basic words, but stay everyday and concrete — 
  avoid abstract, technical, or literary vocabulary.
- Max 3-4 sentences per reply.
- Ask at most one question per turn.
`,
    styleReference: `
Match this sentence style and complexity (English example, apply the same 
structure in the target language):

"I moved to this city two years ago because I got a new job here. At first it 
was hard to make friends, since I didn't know anyone. Now I go to a small gym 
near my apartment, and I've met a few people there. On weekends, if the weather 
is nice, we sometimes go for a walk along the river."
`,
  },

  B2: {
    constraints: `
- Multiple clause types allowed: relative clauses, passive voice, contrastive 
  connectors ("although," "even though," "however"). More than one subordinate 
  clause per sentence is fine.
- Vocabulary can include mild abstraction, opinions, and hedging ("it seems," 
  "I've noticed that"). Still avoid technical or specialist vocabulary.
- Max 4-5 sentences per reply.
- Ask at most one question per turn.
`,
    styleReference: `
Match this sentence style and complexity (English example, apply the same 
structure in the target language):

"Although I was a bit nervous about starting the new job, it turned out to be 
one of the better decisions I've made recently. The team is friendly, and even 
though the workload can get overwhelming at times, there's usually someone 
willing to help if you ask. I've noticed that the way meetings are run here is 
quite different from what I was used to before, which took some getting used to."
`,
  },
};

export function getLevelInstructions(cefrLevel: CEFRLevel): LevelInstructions {
  return levelInstructionsByCefrLevel[cefrLevel];
}
