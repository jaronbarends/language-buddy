export type Scenario = {
  title: string;
  instruction: string;
  aiHasFirstTurn: boolean;
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
