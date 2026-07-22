import { apiClient } from "./axios";

export type AiPromptPayload = {
  prompt: string;
  projectId?: string;
};

export type AiPromptResponse = {
  content: string;
};

export const aiService = {
  generateSuggestion: (payload: AiPromptPayload, token?: string) =>
    apiClient.post<AiPromptResponse, AiPromptPayload>("/ai/suggestions", payload, {
      token,
    }),
};
