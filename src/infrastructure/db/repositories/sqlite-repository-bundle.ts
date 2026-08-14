import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { SqliteAiAuditRepository } from '@/infrastructure/db/repositories/sqlite-ai-audit-repository';
import { SqliteDeliveryRepository } from '@/infrastructure/db/repositories/sqlite-delivery-repository';
import { SqliteEconomyRepository } from '@/infrastructure/db/repositories/sqlite-economy-repository';
import { SqliteEventRepository } from '@/infrastructure/db/repositories/sqlite-event-repository';
import { SqliteMissionRepository } from '@/infrastructure/db/repositories/sqlite-mission-repository';
import { SqliteOrderRepository } from '@/infrastructure/db/repositories/sqlite-order-repository';
import { SqliteRoverRepository } from '@/infrastructure/db/repositories/sqlite-rover-repository';
import { SqliteScenarioRepository } from '@/infrastructure/db/repositories/sqlite-scenario-repository';
import { SqliteSimulationRepository } from '@/infrastructure/db/repositories/sqlite-simulation-repository';
import { SqliteSnapshotRepository } from '@/infrastructure/db/repositories/sqlite-snapshot-repository';
import { SqliteWorldRepository } from '@/infrastructure/db/repositories/sqlite-world-repository';

export class SqliteRepositoryBundle implements RepositoryBundle {
  readonly scenarios;
  readonly missions;
  readonly worlds;
  readonly rovers;
  readonly orders;
  readonly deliveries;
  readonly events;
  readonly economy;
  readonly snapshots;
  readonly simulations;
  readonly aiAudit;
  constructor(db: SqliteDatabase) {
    this.scenarios = new SqliteScenarioRepository(db);
    this.missions = new SqliteMissionRepository(db);
    this.worlds = new SqliteWorldRepository(db);
    this.rovers = new SqliteRoverRepository(db);
    this.orders = new SqliteOrderRepository(db);
    this.deliveries = new SqliteDeliveryRepository(db);
    this.events = new SqliteEventRepository(db);
    this.economy = new SqliteEconomyRepository(db);
    this.snapshots = new SqliteSnapshotRepository(db);
    this.simulations = new SqliteSimulationRepository(db);
    this.aiAudit = new SqliteAiAuditRepository(db);
  }
}
