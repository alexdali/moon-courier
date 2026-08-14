import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { Clock } from '@/application/ports/clock';
import type { IdGenerator } from '@/application/ports/id-generator';
import type { AppEnv } from '@/config/env';
import { getAiModelConfigs, type AiModelConfig } from '@/config/ai-models';
import { estimateTokenCost } from '@/modules/ai/audit/cost-calculator';
import { AiAttemptError } from '@/modules/ai/openrouter/errors';

export interface AiAttemptResult<T> {
  value: T;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  response: unknown;
}

export interface RoutedAiResult<T> {
  value: T;
  model: string;
  role: 'primary' | 'fallback';
  fallbackUsed: boolean;
}

export class ModelRouter {
  private readonly models: readonly AiModelConfig[];
  constructor(
    private readonly env: AppEnv,
    private readonly audit: AiAuditRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {
    this.models = getAiModelConfigs(env);
  }

  async execute<T>(input: {
    requestType: string;
    promptVersion: string;
    missionId?: string | null;
    scenarioId?: string | null;
    request: unknown;
    attempt: (model: AiModelConfig, aiRunId: string) => Promise<AiAttemptResult<T>>;
  }): Promise<RoutedAiResult<T>> {
    const errors: unknown[] = [];
    for (const model of this.models) {
      const id = this.ids.next('ai_run');
      const createdAt = this.clock.now();
      this.audit.startRun({
        id,
        missionId: input.missionId ?? null,
        scenarioId: input.scenarioId ?? null,
        requestType: input.requestType,
        provider: 'openrouter',
        model: model.model,
        modelRole: model.role,
        promptVersion: input.promptVersion,
        request: input.request,
        createdAt,
      });
      try {
        const result = await input.attempt(model, id);
        const cost = result.costUsd > 0
          ? result.costUsd
          : estimateTokenCost(result.inputTokens, result.outputTokens, model);
        this.audit.finishRun(id, {
          status: 'succeeded',
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          costUsd: cost,
          latencyMs: result.latencyMs,
          response: result.response,
          completedAt: this.clock.now(),
        });
        return {
          value: result.value,
          model: model.model,
          role: model.role,
          fallbackUsed: model.role === 'fallback',
        };
      } catch (error) {
        errors.push(error);
        const telemetry = error instanceof AiAttemptError ? error.telemetry : null;
        const inputTokens = telemetry?.inputTokens ?? 0;
        const outputTokens = telemetry?.outputTokens ?? 0;
        const costUsd = telemetry
          ? telemetry.costUsd > 0 ? telemetry.costUsd : estimateTokenCost(inputTokens, outputTokens, model)
          : 0;
        this.audit.finishRun(id, {
          status: error instanceof Error && /invalid|reject|schema|validation|survivable|tool/i.test(error.message) ? 'rejected' : 'failed',
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs: telemetry?.latencyMs ?? 0,
          ...(telemetry?.response === undefined ? {} : { response: telemetry.response }),
          errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
          errorMessage: error instanceof Error ? error.message : String(error),
          completedAt: this.clock.now(),
        });
      }
    }
    throw new AggregateError(errors, 'Primary and fallback AI models failed');
  }
}
