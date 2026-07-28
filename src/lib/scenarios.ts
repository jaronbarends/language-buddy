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
    instruction: '', // scenario content here
    aiHasFirstTurn: true,
  },
];
