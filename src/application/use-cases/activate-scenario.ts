import type { Clock } from '@/application/ports/clock';
import type { IdGenerator } from '@/application/ports/id-generator';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { TransactionRunner } from '@/application/ports/transaction-runner';
import { createPersistentMissionState } from '@/application/services/mission-state-factory';
import { NotFoundError } from '@/domain/common/errors';
import type { EconomyEntry } from '@/domain/entities/economy';

export class ActivateScenarioUseCase {
  constructor(
    private readonly repositories: RepositoryBundle,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}
  execute(scenarioId: string): string {
    const scenario = this.repositories.scenarios.getById(scenarioId);
    if (!scenario) throw new NotFoundError('Scenario', scenarioId);
    const now = this.clock.now();
    const missionId = this.ids.next('mission');
    const state = createPersistentMissionState({ scenario, missionId, now });
    const initial: EconomyEntry = {
      id: `${missionId}_economy_initial`, missionId, deliveryId: null, eventId: null, type: 'initial',
      amountCredits: scenario.rules.startingCredits, balanceAfter: scenario.rules.startingCredits,
      description: 'Mission starting credits', createdAt: now,
    };
    this.transactions.run(() => {
      this.repositories.missions.deleteAll();
      this.repositories.missions.create(state.mission);
      this.repositories.rovers.insertMany(state.rovers);
      this.repositories.orders.insertMany(state.orders);
      this.repositories.economy.insertMany([initial]);
      this.repositories.snapshots.save(missionId, 'scenario_activated', state, now);
    });
    return missionId;
  }
}
