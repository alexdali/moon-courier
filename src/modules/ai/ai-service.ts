import type { AiService } from '@/application/ports/ai-service';
import type { Clock } from '@/application/ports/clock';
import type { IdGenerator } from '@/application/ports/id-generator';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { AppEnv } from '@/config/env';
import { getFeatureFlags } from '@/config/feature-flags';
import { analyzeScenarioBalance } from '@/domain/scenarios/balance-analyzer';
import { compileScenarioBlueprint } from '@/domain/scenarios/scenario-compiler';
import { createDeterministicScenarioBlueprint } from '@/domain/scenarios/deterministic-generator';
import { validateScenario } from '@/domain/scenarios/scenario-validator';
import { AiBudgetGuard } from '@/modules/ai/audit/budget-guard';
import { MissionControlAgent } from '@/modules/ai/agents/mission-control-agent';
import { DeterministicAssistant } from '@/modules/ai/offline/deterministic-assistant';
import { OpenRouterClient } from '@/modules/ai/openrouter/client';
import { ModelRouter } from '@/modules/ai/routing/model-router';
import { AiScenarioGenerator } from '@/modules/ai/scenarios/scenario-generator';

export class MoonCourierAiService implements AiService {
  private readonly client: OpenRouterClient;
  private readonly router: ModelRouter;
  private readonly agent: MissionControlAgent;
  private readonly scenarioGenerator: AiScenarioGenerator;
  private readonly deterministicAssistant: DeterministicAssistant;
  private readonly budget: AiBudgetGuard;

  constructor(
    private readonly env: AppEnv,
    private readonly repositories: RepositoryBundle,
    clock: Clock,
    ids: IdGenerator,
  ) {
    this.client = new OpenRouterClient(env);
    this.router = new ModelRouter(env, repositories.aiAudit, clock, ids);
    this.agent = new MissionControlAgent(env, repositories, this.client, repositories.aiAudit);
    this.scenarioGenerator = new AiScenarioGenerator(env, this.client, repositories.aiAudit);
    this.deterministicAssistant = new DeterministicAssistant(repositories);
    this.budget = new AiBudgetGuard(repositories.aiAudit, env);
  }

  async answerMissionQuestion(input: {
    missionId: string;
    message: string;
    selectedOrderId?: string;
    selectedRoverId?: string;
  }) {
    if (!getFeatureFlags().aiEnabled) return this.deterministicAssistant.answer(input);
    try {
      this.budget.assertAvailable();
      const routed = await this.router.execute({
        requestType: 'mission_control',
        promptVersion: this.agent.promptVersion,
        missionId: input.missionId,
        request: input,
        attempt: (model, aiRunId) => this.agent.run({ model, aiRunId, ...input }),
      });
      return {
        ...routed.value,
        mode: 'online' as const,
        model: routed.model,
        fallbackUsed: routed.fallbackUsed,
      };
    } catch {
      return this.deterministicAssistant.answer(input);
    }
  }

  async generateScenario(input: {
    prompt: string;
    seed?: number;
    difficulty?: 'easy' | 'normal' | 'hard' | 'crisis';
    durationDays?: number;
  }) {
    if (getFeatureFlags().aiEnabled) {
      try {
        this.budget.assertAvailable();
        const routed = await this.router.execute({
          requestType: 'scenario_generation',
          promptVersion: this.scenarioGenerator.promptVersion,
          request: input,
          attempt: (model, aiRunId) => this.scenarioGenerator.run({ model, aiRunId, ...input }),
        });
        const source = routed.role === 'primary' ? ('deepseek' as const) : ('luna' as const);
        const scenario = { ...routed.value.scenario, source: 'ai' as const };
        this.repositories.scenarios.save(scenario, {
          validation: routed.value.validation,
          prompt: input.prompt,
          model: routed.model,
        });
        return {
          ...routed.value,
          scenario,
          source,
          model: routed.model,
          fallbackUsed: routed.fallbackUsed,
        };
      } catch {
        // Deterministic degradation keeps the simulator usable after both configured models fail.
      }
    }
    const base = createDeterministicScenarioBlueprint(input.seed ?? Math.floor(Date.now() / 1000));
    const blueprint = {
      ...base,
      title: input.prompt.slice(0, 72).replace(/[.?!]+$/, '') || base.title,
      ...(input.difficulty ? { difficulty: input.difficulty } : {}),
      ...(input.durationDays ? { durationDays: input.durationDays } : {}),
    };
    const scenario = { ...compileScenarioBlueprint(blueprint), source: 'manual' as const };
    const validation = validateScenario(scenario);
    const balance = analyzeScenarioBalance(scenario, 50);
    this.repositories.scenarios.save(scenario, {
      validation,
      prompt: input.prompt,
      model: 'deterministic-fallback',
    });
    return {
      source: 'deterministic' as const,
      model: null,
      blueprint,
      scenario,
      validation,
      balance,
      fallbackUsed: false,
    };
  }
}
