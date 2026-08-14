import { ChargeRoverUseCase } from '@/application/use-cases/charge-rover';
import { GetAnalyticsDashboardUseCase } from '@/application/use-cases/get-analytics-dashboard';
import { GetMissionDashboardUseCase } from '@/application/use-cases/get-mission-dashboard';
import { InitializeDemoUseCase } from '@/application/use-cases/initialize-demo';
import { LaunchDeliveryUseCase } from '@/application/use-cases/launch-delivery';
import { PreviewDispatchUseCase } from '@/application/use-cases/preview-dispatch';
import { RepairRoverUseCase } from '@/application/use-cases/repair-rover';
import { createDatabase } from '@/infrastructure/db/client';
import { MetricsQueryRepository } from '@/infrastructure/db/metrics-query-repository';
import { SqliteRepositoryBundle } from '@/infrastructure/db/repositories/sqlite-repository-bundle';
import { SqliteTransactionRunner } from '@/infrastructure/db/repositories/sqlite-transaction-runner';
import { FakeClock } from '@/test/helpers/fake-clock';
import { FakeIdGenerator } from '@/test/helpers/fake-id-generator';

export function createTestContext() {
  const db = createDatabase(':memory:');
  const repositories = new SqliteRepositoryBundle(db);
  const transactions = new SqliteTransactionRunner(db);
  const clock = new FakeClock();
  const ids = new FakeIdGenerator();
  const initialize = new InitializeDemoUseCase(repositories, transactions, clock);
  return {
    db,
    repositories,
    transactions,
    clock,
    ids,
    metrics: new MetricsQueryRepository(db),
    useCases: {
      initialize,
      dashboard: new GetMissionDashboardUseCase(repositories),
      preview: new PreviewDispatchUseCase(repositories),
      launch: new LaunchDeliveryUseCase(repositories, transactions, clock, ids),
      charge: new ChargeRoverUseCase(repositories, transactions, clock),
      repair: new RepairRoverUseCase(repositories, transactions, clock),
      analytics: new GetAnalyticsDashboardUseCase(repositories, clock),
    },
  };
}
