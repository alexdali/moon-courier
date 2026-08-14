import { z } from 'zod';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { applyCounterfactual, counterfactualLabels, type CounterfactualKey } from '@/domain/analytics/counterfactual';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { runMonteCarlo } from '@/domain/simulation/mission-simulator';
import type { AiTool } from '@/modules/ai/tools/types';

const argsSchema = z.object({
  options: z.array(z.enum(['baseline', 'extra-heavy-rover', 'faster-charging', 'safer-routes'])).min(1).max(4).default(['baseline', 'extra-heavy-rover', 'faster-charging']),
  iterations: z.number().int().min(20).max(500).default(100),
});
type Args = z.infer<typeof argsSchema>;

export class CompareFleetOptionsTool implements AiTool<Args> {
  readonly definition = {
    type: 'function' as const,
    function: {
      name: 'compare_fleet_options',
      description: 'Run deterministic Monte Carlo comparisons for fleet or route changes and return computed success/economy metrics.',
      parameters: {
        type: 'object', additionalProperties: false,
        properties: {
          options: { type: 'array', items: { type: 'string', enum: ['baseline', 'extra-heavy-rover', 'faster-charging', 'safer-routes'] } },
          iterations: { type: 'integer', minimum: 20, maximum: 500 },
        },
      },
    },
  };
  constructor(private readonly repositories: RepositoryBundle) {}
  execute(rawArgs: Args, context: { missionId: string }) {
    const args = argsSchema.parse(rawArgs);
    const state = loadMissionState(this.repositories, context.missionId);
    const comparisons = args.options.map((key) => ({
      key,
      label: counterfactualLabels[key as CounterfactualKey],
      summary: runMonteCarlo({ scenario: applyCounterfactual(state.scenario, key as CounterfactualKey), policy: safeBalancedPolicy, iterations: args.iterations, seed: state.scenario.seed }).summary,
    }));
    const best = [...comparisons].sort((left, right) => right.summary.successRate - left.summary.successRate)[0];
    return {
      data: { comparisons, iterationsPerOption: args.iterations },
      summary: best ? `${best.label} has the highest simulated success rate: ${Math.round(best.summary.successRate * 100)}% across ${args.iterations} runs.` : 'No comparison produced.',
    };
  }
}
