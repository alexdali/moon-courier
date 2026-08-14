import type { RoverChargeDto } from '@/application/dto/rover-charge';
import type { Clock } from '@/application/ports/clock';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { TransactionRunner } from '@/application/ports/transaction-runner';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { ConflictError, NotFoundError } from '@/domain/common/errors';
import { evaluateMissionGoal } from '@/domain/rules/mission-goal';
import { resolveRoverCharge } from '@/domain/simulation/rover-charger';

export class ChargeRoverUseCase {
  constructor(
    private readonly repositories: RepositoryBundle,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  execute(input: { missionId?: string; roverId: string; targetBatteryPercent?: number }): RoverChargeDto {
    return this.transactions.run(() => {
      const state = loadMissionState(this.repositories, input.missionId);
      if (state.mission.status !== 'active') {
        throw new ConflictError(`Mission ${state.mission.id} is ${state.mission.status}`);
      }
      const rover = state.rovers.find((item) => item.id === input.roverId);
      if (!rover) throw new NotFoundError('Rover', input.roverId);
      const now = this.clock.now();
      const resolution = resolveRoverCharge({
        mission: state.mission,
        scenario: state.scenario,
        rover,
        sequence: this.repositories.events.getNextSequence(state.mission.id),
        occurredAt: now,
        ...(input.targetBatteryPercent === undefined ? {} : { targetBatteryPercent: input.targetBatteryPercent }),
      });
      const roversAfter = state.rovers.map((item) => item.id === rover.id ? resolution.roverAfter : item);
      const goal = evaluateMissionGoal(resolution.missionAfter, state.orders, state.scenario.rules);
      const missionAfter = {
        ...resolution.missionAfter,
        status: goal.state === 'won' ? 'completed' as const : goal.state === 'lost' ? 'failed' as const : 'active' as const,
        endedAt: goal.state === 'in_progress' ? null : now,
      };
      this.repositories.rovers.update(resolution.roverAfter);
      this.repositories.missions.update(missionAfter);
      this.repositories.events.insertMany([resolution.event]);
      this.repositories.economy.insertMany([resolution.economyEntry]);
      this.repositories.snapshots.save(state.mission.id, 'rover_charged', {
        mission: missionAfter,
        rovers: roversAfter,
        plan: resolution.plan,
      }, now);
      return {
        mission: missionAfter,
        rover: resolution.roverAfter,
        event: resolution.event,
        economyEntry: resolution.economyEntry,
        plan: resolution.plan,
      };
    });
  }
}
