import type { Clock } from '@/application/ports/clock';
import type { IdGenerator } from '@/application/ports/id-generator';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { applyCounterfactual, counterfactualLabels, type CounterfactualKey } from '@/domain/analytics/counterfactual';
import type { SimulationRun } from '@/domain/entities/simulation';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { runMonteCarlo } from '@/domain/simulation/mission-simulator';

export class RunScenarioComparisonUseCase {
  constructor(
    private readonly repositories: RepositoryBundle,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}
  execute(input: { missionId?: string; iterations: number; options?: readonly CounterfactualKey[] }) {
    const state = loadMissionState(this.repositories, input.missionId);
    const options = input.options ?? ['baseline', 'extra-heavy-rover', 'faster-charging'];
    return options.map((key) => {
      const startedAt = this.clock.now();
      const result = runMonteCarlo({
        scenario: applyCounterfactual(state.scenario, key),
        policy: { ...safeBalancedPolicy, name: key },
        iterations: input.iterations,
        seed: state.scenario.seed,
      });
      const run: SimulationRun = {
        id: this.ids.next('simulation'),
        missionId: state.mission.id,
        scenarioId: state.scenario.id,
        kind: key === 'baseline' ? 'benchmark' : 'counterfactual',
        policy: { ...safeBalancedPolicy, name: key },
        seed: state.scenario.seed,
        iterations: input.iterations,
        status: 'completed',
        summary: result.summary,
        startedAt,
        completedAt: this.clock.now(),
        error: null,
      };
      this.repositories.simulations.save(run, result.samples);
      return { key, label: counterfactualLabels[key], run };
    });
  }
}
