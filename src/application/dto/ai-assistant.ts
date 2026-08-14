export interface AiAssistantResponseDto {
  answer: string;
  mode: 'online' | 'deterministic';
  model: string | null;
  fallbackUsed: boolean;
  toolCalls: readonly {
    name: string;
    arguments: unknown;
    resultSummary: string;
  }[];
  suggestedSelection?: {
    orderId: string;
    roverId: string;
  };
}
