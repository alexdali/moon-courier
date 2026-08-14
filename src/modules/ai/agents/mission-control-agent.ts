import type { AiAssistantResponseDto } from '@/application/dto/ai-assistant';
import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import type { AppEnv } from '@/config/env';
import type { AiModelConfig } from '@/config/ai-models';
import { missionControlContext, missionControlSystemPrompt, MISSION_CONTROL_PROMPT_VERSION } from '@/modules/ai/prompts/mission-control';
import { OpenRouterClient } from '@/modules/ai/openrouter/client';
import { buildOpenRouterRequest } from '@/modules/ai/openrouter/request-builder';
import { parseJsonContent } from '@/modules/ai/openrouter/response-parser';
import { AiAttemptError, AiOutputError, AiProviderError } from '@/modules/ai/openrouter/errors';
import type { OpenRouterMessage } from '@/modules/ai/openrouter/types';
import type { AiAttemptResult } from '@/modules/ai/routing/model-router';
import { MissionToolRegistry } from '@/modules/ai/tools/tool-registry';

export class MissionControlAgent {
  private readonly tools: MissionToolRegistry;

  constructor(
    private readonly env: AppEnv,
    private readonly repositories: RepositoryBundle,
    private readonly client: OpenRouterClient,
    private readonly audit: AiAuditRepository,
  ) {
    this.tools = new MissionToolRegistry(repositories);
  }

  get promptVersion(): string { return MISSION_CONTROL_PROMPT_VERSION; }

  async run(input: {
    model: AiModelConfig;
    aiRunId: string;
    missionId: string;
    message: string;
    selectedOrderId?: string;
    selectedRoverId?: string;
  }): Promise<AiAttemptResult<Omit<AiAssistantResponseDto, 'mode' | 'model' | 'fallbackUsed'>>> {
    const state = loadMissionState(this.repositories, input.missionId);
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: missionControlSystemPrompt() },
      {
        role: 'system',
        content: `CURRENT_STATE_JSON:\n${missionControlContext({
          mission: state.mission,
          rovers: state.rovers,
          orders: state.orders,
          ...(input.selectedOrderId ? { selectedOrderId: input.selectedOrderId } : {}),
          ...(input.selectedRoverId ? { selectedRoverId: input.selectedRoverId } : {}),
        })}`,
      },
      { role: 'user', content: input.message },
    ];
    let inputTokens = 0;
    let outputTokens = 0;
    let costUsd = 0;
    let latencyMs = 0;
    const executed: { name: string; arguments: unknown; resultSummary: string }[] = [];
    let suggestedSelection: { orderId: string; roverId: string } | undefined;
    let usedTool = false;
    let lastResponse: unknown = null;

    try {
      for (let turn = 0; turn < this.env.AI_MAX_TOOL_TURNS; turn += 1) {
        const completion = await this.client.complete(buildOpenRouterRequest({
          env: this.env,
          model: input.model.model,
          messages,
          tools: this.tools.definitions(),
          temperature: 0.1,
        }));
        inputTokens += completion.usage.prompt_tokens;
        outputTokens += completion.usage.completion_tokens;
        costUsd += completion.usage.cost;
        latencyMs += completion.latencyMs;
        lastResponse = completion.response;
        const toolCalls = completion.message.tool_calls ?? [];

        if (toolCalls.length > 0) {
          usedTool = true;
          messages.push(completion.message);
          for (const call of toolCalls) {
            const argumentsValue = parseJsonContent<unknown>(call.function.arguments || '{}');
            const started = performance.now();
            const auditId = `${input.aiRunId}_${call.id}`;
            const createdAt = new Date().toISOString();
            this.audit.recordToolCall({
              id: auditId,
              aiRunId: input.aiRunId,
              toolCallId: call.id,
              name: call.function.name,
              arguments: argumentsValue,
              durationMs: 0,
              status: 'started',
              createdAt,
            });
            try {
              const result = await this.tools.execute(call.function.name, argumentsValue, input.missionId);
              const durationMs = Math.round(performance.now() - started);
              executed.push({ name: call.function.name, arguments: argumentsValue, resultSummary: result.summary });
              if (result.suggestedSelection) suggestedSelection = result.suggestedSelection;
              this.audit.recordToolCall({
                id: auditId,
                aiRunId: input.aiRunId,
                toolCallId: call.id,
                name: call.function.name,
                arguments: argumentsValue,
                result: result.data,
                durationMs,
                status: 'succeeded',
                createdAt,
              });
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                name: call.function.name,
                content: JSON.stringify(result.data),
              });
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              this.audit.recordToolCall({
                id: auditId,
                aiRunId: input.aiRunId,
                toolCallId: call.id,
                name: call.function.name,
                arguments: argumentsValue,
                durationMs: Math.round(performance.now() - started),
                status: 'failed',
                errorMessage: message,
                createdAt,
              });
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                name: call.function.name,
                content: JSON.stringify({ error: message }),
              });
            }
          }
          continue;
        }

        const answer = completion.message.content?.trim();
        if (!answer) throw new AiOutputError('Mission Control returned no final answer');
        if (!usedTool && !/^(hi|hello|hey|привет|здравствуй)/i.test(input.message.trim())) {
          throw new AiOutputError('Mission Control answered an operational question without calling a deterministic tool');
        }
        return {
          value: {
            answer,
            toolCalls: executed,
            ...(suggestedSelection ? { suggestedSelection } : {}),
          },
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs,
          response: lastResponse,
        };
      }
      throw new AiOutputError(`Mission Control exceeded ${this.env.AI_MAX_TOOL_TURNS} tool turns`);
    } catch (error) {
      if (error instanceof AiProviderError || error instanceof AiAttemptError || inputTokens === 0) throw error;
      throw new AiAttemptError(
        error instanceof Error ? error.message : 'Mission Control output validation failed',
        {
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs,
          ...(lastResponse === null ? {} : { response: lastResponse }),
        },
        error,
      );
    }
  }
}
