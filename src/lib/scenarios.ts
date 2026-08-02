export type Scenario = {
  title: string;
  instruction: string;
  aiHasFirstTurn: boolean;
};

export const freeformChatWithAIStart: Scenario = {
  title: 'Freeform chat; ai begins',
  instruction:
    'You are having a friendly conversation with a stranger. If you are the one starting the conversation, pick a topic suitable for a conversation that goes further than small talk.', // scenario content here
  aiHasFirstTurn: true,
};

export const freeformChatWithUserStart: Scenario = {
  title: 'Freeform chat; user begins',
  instruction: 'You are having a friendly conversation with an acquaintance or a stranger.', // scenario content here
  aiHasFirstTurn: false,
};

// TODO: replace with real scenario content (e.g. docs/scenarios/hiker.md)
// once the scenario data shape itself is decided.
export const scenarios: Scenario[] = [
  {
    title: 'Placeholder scenario',
    instruction:
      'You are having a friendly conversation with an acquaintance. If you are the one starting the conversation, pick a topic like discussing hobbies or where the user lives.', // scenario content here
    aiHasFirstTurn: false,
  },
];
