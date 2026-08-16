import type { ScenarioGenerationDto } from '@/application/dto/scenario-generation';
import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { AppEnv } from '@/config/env';
import type { AiModelConfig } from '@/config/ai-models';
import type { ScenarioBlueprint } from '@/domain/scenarios/blueprint';
import { analyzeScenarioBalance } from '@/domain/scenarios/balance-analyzer';
import { compileScenarioBlueprint } from '@/domain/scenarios/scenario-compiler';
import { validateScenario } from '@/domain/scenarios/scenario-validator';
import {
  scenarioArchitectSystemPrompt,
  SCENARIO_ARCHITECT_PROMPT_VERSION,
} from '@/modules/ai/prompts/scenario-architect';
import {
  scenarioBlueprintJsonSchema,
  scenarioBlueprintSchema,
} from '@/modules/ai/schemas/scenario-blueprint-schema';
import { OpenRouterClient } from '@/modules/ai/openrouter/client';
import { buildOpenRouterRequest } from '@/modules/ai/openrouter/request-builder';
import { parseJsonContent } from '@/modules/ai/openrouter/response-parser';
import { AiAttemptError, AiOutputError } from '@/modules/ai/openrouter/errors';
import type { AiAttemptResult } from '@/modules/ai/routing/model-router';

export class AiScenarioGenerator {
  constructor(
    private readonly env: AppEnv,
    private readonly client: OpenRouterClient,
    private readonly audit: AiAuditRepository,
  ) {}
  get promptVersion(): string {
    return SCENARIO_ARCHITECT_PROMPT_VERSION;
  }

  async run(input: {
    model: AiModelConfig;
    aiRunId: string;
    prompt: string;
    seed?: number;
    difficulty?: 'easy' | 'normal' | 'hard' | 'crisis';
    durationDays?: number;
  }): Promise<AiAttemptResult<Omit<ScenarioGenerationDto, 'source' | 'model' | 'fallbackUsed'>>> {
    const explicit = {
      requestedSeed: input.seed ?? null,
      requestedDifficulty: input.difficulty ?? null,
      requestedDurationDays: input.durationDays ?? null,
    };
    const request = buildOpenRouterRequest({
      env: this.env,
      model: input.model.model,
      messages: [
        { role: 'system', content: scenarioArchitectSystemPrompt() },
        {
          role: 'user',
          content: `${input.prompt}\n\nExplicit constraints: ${JSON.stringify(explicit)}`,
        },
      ],
      responseFormat: {
        type: 'json_schema',
        json_schema: {
          name: 'moon_courier_scenario',
          strict: true,
          schema: scenarioBlueprintJsonSchema,
        },
      },
    });
    this.audit.recordProviderRequest(input.aiRunId, request);
    const completion = await this.client.complete(request);
    try {
      const raw = parseJsonContent<unknown>(completion.message.content);
      const parsed = scenarioBlueprintSchema.parse(raw);
      const blueprint: ScenarioBlueprint = {
        ...parsed,
        ...(input.seed ? { seed: input.seed } : {}),
        ...(input.difficulty ? { difficulty: input.difficulty } : {}),
        ...(input.durationDays ? { durationDays: input.durationDays } : {}),
      };
      const scenario = compileScenarioBlueprint(blueprint);
      const validation = validateScenario(scenario);
      if (!validation.valid)
        throw new AiOutputError('Generated scenario failed deterministic validation', validation);
      const balance = analyzeScenarioBalance(scenario, 80);
      if (!balance.survivable)
        throw new AiOutputError(
          'Generated scenario is not survivable in balance simulation',
          balance,
        );
      return {
        value: { blueprint, scenario, validation, balance },
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
        cachedTokens: completion.usage.cached_tokens,
        cacheWriteTokens: completion.usage.cache_write_tokens,
        costUsd: completion.usage.cost,
        latencyMs: completion.latencyMs,
        response: completion.response,
      };
    } catch (error) {
      throw new AiAttemptError(
        error instanceof Error ? error.message : 'Scenario output validation failed',
        {
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          cachedTokens: completion.usage.cached_tokens,
          cacheWriteTokens: completion.usage.cache_write_tokens,
          costUsd: completion.usage.cost,
          latencyMs: completion.latencyMs,
          response: completion.response,
        },
        error,
      );
    }
  }
}
