import type { Clock } from '@/application/ports/clock';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { TransactionRunner } from '@/application/ports/transaction-runner';
import { createPersistentMissionState } from '@/application/services/mission-state-factory';
import type { EconomyEntry } from '@/domain/entities/economy';
import { validateScenario } from '@/domain/scenarios/scenario-validator';
import { createDemoScenario, DEMO_MISSION_ID } from '@/fixtures/demo-scenario';

export class InitializeDemoUseCase {
  constructor(
    private readonly repositories: RepositoryBundle,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  execute(options: { force?: boolean } = {}): string {
    const current = this.repositories.missions.getCurrent();
    if (current && !options.force) return current.id;
    const scenario = createDemoScenario();
    const validation = validateScenario(scenario);
    if (!validation.valid) throw new Error('Built-in scenario failed validation');
    const now = this.clock.now();
    const state = createPersistentMissionState({ scenario, missionId: DEMO_MISSION_ID, now });
    this.transactions.run(() => {
      if (options.force) this.repositories.missions.deleteAll();
      this.repositories.scenarios.save(scenario, { validation, prompt: 'Built-in deterministic fixture' });
      this.repositories.missions.create(state.mission);
      this.repositories.rovers.insertMany(state.rovers);
      this.repositories.orders.insertMany(state.orders);
      const initial: EconomyEntry = {
        id: `${state.mission.id}_economy_initial`,
        missionId: state.mission.id,
        deliveryId: null,
        eventId: null,
        type: 'initial',
        amountCredits: scenario.rules.startingCredits,
        balanceAfter: scenario.rules.startingCredits,
        description: 'Mission starting credits',
        createdAt: now,
      };
      this.repositories.economy.insertMany([initial]);
      this.repositories.snapshots.save(state.mission.id, 'mission_initialized', state, now);
    });
    return state.mission.id;
  }
}
