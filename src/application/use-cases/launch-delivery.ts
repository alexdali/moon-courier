import type { DeliveryReplayDto } from '@/application/dto/delivery-replay';
import type { Clock } from '@/application/ports/clock';
import type { IdGenerator } from '@/application/ports/id-generator';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { TransactionRunner } from '@/application/ports/transaction-runner';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { DispatchImpossibleError, NotFoundError } from '@/domain/common/errors';
import { evaluateMissionGoal } from '@/domain/rules/mission-goal';
import { resolveDelivery } from '@/domain/simulation/delivery-resolver';
import { PreviewDispatchUseCase } from '@/application/use-cases/preview-dispatch';

/**
 * Atomically performs the only state-changing dispatch operation.
 * The client only animates the persisted replay; it never decides the outcome.
 */
export class LaunchDeliveryUseCase {
  private readonly preview: PreviewDispatchUseCase;

  constructor(
    private readonly repositories: RepositoryBundle,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {
    this.preview = new PreviewDispatchUseCase(repositories);
  }

  execute(input: {
    missionId: string;
    orderId: string;
    roverId: string;
    objective?: 'fastest' | 'safest' | 'efficient' | 'balanced';
    idempotencyKey: string;
  }): DeliveryReplayDto {
    return this.transactions.run(() => {
      const existing = this.repositories.deliveries.getByIdempotencyKey(input.idempotencyKey);
      if (existing) return this.replayExisting(existing.id);

      const state = loadMissionState(this.repositories, input.missionId);
      if (!['ready', 'active'].includes(state.mission.status)) {
        throw new DispatchImpossibleError({ message: `Mission is ${state.mission.status}` });
      }
      const order = state.orders.find((item) => item.id === input.orderId);
      const rover = state.rovers.find((item) => item.id === input.roverId);
      if (!order) throw new NotFoundError('Order', input.orderId);
      if (!rover) throw new NotFoundError('Rover', input.roverId);

      const preview = this.preview.execute(input);
      if (preview.feasibility.status === 'impossible' || !preview.route || !preview.economy) {
        throw new DispatchImpossibleError(preview.feasibility);
      }

      const now = this.clock.now();
      const deliveryId = this.ids.next('delivery');
      const resolution = resolveDelivery({
        mission: state.mission,
        scenario: state.scenario,
        rover,
        order,
        route: preview.route,
        deliveryId,
        idempotencyKey: input.idempotencyKey,
        startedAt: now,
        eventSequenceStart: this.repositories.events.getNextSequence(state.mission.id) - 1,
        expectedNetCredits: preview.economy.expectedNetCredits,
      });
      const allOrdersAfter = state.orders.map((item) => item.id === order.id ? resolution.orderAfter : item);
      const goal = evaluateMissionGoal(resolution.missionAfter, allOrdersAfter, state.scenario.rules);
      const missionAfter = {
        ...resolution.missionAfter,
        status: goal.state === 'won' ? 'completed' as const : goal.state === 'lost' ? 'failed' as const : 'active' as const,
        endedAt: goal.state === 'in_progress' ? null : resolution.delivery.completedAt,
      };

      this.repositories.deliveries.insert(resolution.delivery, resolution.segments);
      this.repositories.rovers.update(resolution.roverAfter);
      this.repositories.orders.update(resolution.orderAfter);
      this.repositories.missions.update(missionAfter);
      this.repositories.events.insertMany(resolution.events);
      this.repositories.economy.insertMany(resolution.economyEntries);
      this.repositories.snapshots.save(state.mission.id, `delivery_${resolution.delivery.status}`, {
        mission: missionAfter,
        rover: resolution.roverAfter,
        order: resolution.orderAfter,
        delivery: resolution.delivery,
      }, now);

      return {
        delivery: resolution.delivery,
        mission: missionAfter,
        rover: resolution.roverAfter,
        order: resolution.orderAfter,
        events: resolution.events,
        economyEntries: resolution.economyEntries,
        segments: resolution.segments,
      };
    });
  }

  private replayExisting(deliveryId: string): DeliveryReplayDto {
    const delivery = this.repositories.deliveries.getById(deliveryId);
    if (!delivery) throw new NotFoundError('Delivery', deliveryId);
    const mission = this.repositories.missions.getById(delivery.missionId);
    const rover = this.repositories.rovers.getById(delivery.roverId);
    const order = this.repositories.orders.getById(delivery.orderId);
    if (!mission || !rover || !order) throw new NotFoundError('Delivery state', deliveryId);
    return {
      delivery,
      mission,
      rover,
      order,
      events: this.repositories.events.listByMission(mission.id).filter((event) => event.deliveryId === delivery.id),
      economyEntries: this.repositories.economy.listByMission(mission.id).filter((entry) => entry.deliveryId === delivery.id),
      segments: [],
    };
  }
}
