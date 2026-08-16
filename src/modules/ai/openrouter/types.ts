export type OpenRouterRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OpenRouterToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: readonly OpenRouterToolCall[];
}

export interface OpenRouterToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenRouterRequest {
  model: string;
  messages: readonly OpenRouterMessage[];
  tools?: readonly OpenRouterToolDefinition[];
  tool_choice?: 'auto' | 'none' | 'required';
  response_format?: Record<string, unknown>;
  max_tokens?: number;
  reasoning?: { enabled: boolean; effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' };
  provider?: { require_parameters?: boolean; data_collection?: 'allow' | 'deny' };
}

export interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  cost_details?: { upstream_inference_cost?: number };
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: readonly {
    index: number;
    finish_reason: string | null;
    message: OpenRouterMessage;
  }[];
  usage?: OpenRouterUsage;
  error?: { code?: number | string; message?: string; metadata?: unknown };
}

export interface OpenRouterCompletion {
  response: OpenRouterResponse;
  message: OpenRouterMessage;
  usage: Required<Pick<OpenRouterUsage, 'prompt_tokens' | 'completion_tokens'>> & { cost: number };
  latencyMs: number;
}
