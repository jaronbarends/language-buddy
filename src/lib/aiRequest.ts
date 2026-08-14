export type AIRequestParams = {
  input: string;
  systemInstruction: string;
  previousInteractionId?: string;
  abortSignal?: AbortSignal;
};
