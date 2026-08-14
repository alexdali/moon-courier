import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { DeliveryRepository } from '@/application/ports/delivery-repository';
import type { EconomyRepository } from '@/application/ports/economy-repository';
import type { EventRepository } from '@/application/ports/event-repository';
import type { MissionRepository } from '@/application/ports/mission-repository';
import type { OrderRepository } from '@/application/ports/order-repository';
import type { RoverRepository } from '@/application/ports/rover-repository';
import type { ScenarioRepository } from '@/application/ports/scenario-repository';
import type { SimulationRepository } from '@/application/ports/simulation-repository';
import type { SnapshotRepository } from '@/application/ports/snapshot-repository';
import type { WorldRepository } from '@/application/ports/world-repository';

export interface RepositoryBundle {
  scenarios: ScenarioRepository;
  missions: MissionRepository;
  worlds: WorldRepository;
  rovers: RoverRepository;
  orders: OrderRepository;
  deliveries: DeliveryRepository;
  events: EventRepository;
  economy: EconomyRepository;
  snapshots: SnapshotRepository;
  simulations: SimulationRepository;
  aiAudit: AiAuditRepository;
}
