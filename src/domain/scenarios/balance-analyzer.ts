import type { ScenarioDefinition } from '@/domain/entities/scenario';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { runMonteCarlo } from '@/domain/simulation/mission-simulator';

export interface ScenarioBalanceReport {
  survivable: boolean;
  quality: 'too_easy' | 'balanced' | 'too_hard';
  successRate: number;
  notes: readonly string[];
}

export function analyzeScenarioBalance(scenario: ScenarioDefinition, iterations = 50): ScenarioBalanceReport {
  const { summary } = runMonteCarlo({
    scenario,
    policy: safeBalancedPolicy,
    iterations,
    seed: scenario.seed,
  });
  const quality = summary.successRate > 0.9 ? 'too_easy' : summary.successRate < 0.2 ? 'too_hard' : 'balanced';
  return {
    survivable: summary.successRate > 0,
    quality,
    successRate: summary.successRate,
    notes: [
      `Safe-balanced policy success rate: ${Math.round(summary.successRate * 100)}%`,
      `Median final credits: ${summary.medianFinalCredits}`,
      `Mean completion rate: ${Math.round(summary.meanCompletionRate * 100)}%`,
    ],
  };
}
