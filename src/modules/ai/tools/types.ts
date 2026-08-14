import type { OpenRouterToolDefinition } from '@/modules/ai/openrouter/types';

export interface AiToolExecutionContext {
  missionId: string;
}

export interface AiToolResult {
  data: unknown;
  summary: string;
  suggestedSelection?: { orderId: string; roverId: string };
}

export interface AiTool<TArgs = unknown> {
  definition: OpenRouterToolDefinition;
  execute(args: TArgs, context: AiToolExecutionContext): AiToolResult | Promise<AiToolResult>;
}
