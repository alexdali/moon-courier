import { getEnv } from '@/config/env';
import { ActivateScenarioUseCase } from '@/application/use-cases/activate-scenario';
import { AskMissionControlUseCase } from '@/application/use-cases/ask-mission-control';
import { ChargeRoverUseCase } from '@/application/use-cases/charge-rover';
import { GenerateScenarioUseCase } from '@/application/use-cases/generate-scenario';
import { GetAnalyticsDashboardUseCase } from '@/application/use-cases/get-analytics-dashboard';
import { GetAiRunHistoryUseCase } from '@/application/use-cases/get-ai-run-history';
import { GetMissionDashboardUseCase } from '@/application/use-cases/get-mission-dashboard';
import { GetOpsSummaryUseCase } from '@/application/use-cases/get-ops-summary';
import { InitializeDemoUseCase } from '@/application/use-cases/initialize-demo';
import { LaunchDeliveryUseCase } from '@/application/use-cases/launch-delivery';
import { ListScenariosUseCase } from '@/application/use-cases/list-scenarios';
import { PreviewDispatchUseCase } from '@/application/use-cases/preview-dispatch';
import { RepairRoverUseCase } from '@/application/use-cases/repair-rover';
import { ResetDemoUseCase } from '@/application/use-cases/reset-demo';
import { RunScenarioComparisonUseCase } from '@/application/use-cases/run-scenario-comparison';
import { getDatabase } from '@/infrastructure/db/client';
import { MetricsQueryRepository } from '@/infrastructure/db/metrics-query-repository';
import { SqliteRepositoryBundle } from '@/infrastructure/db/repositories/sqlite-repository-bundle';
import { SqliteTransactionRunner } from '@/infrastructure/db/repositories/sqlite-transaction-runner';
import { SystemClock } from '@/infrastructure/system/system-clock';
import { UuidGenerator } from '@/infrastructure/system/uuid-generator';
import { MoonCourierAiService } from '@/modules/ai/ai-service';

export function createAppContainer() {
  const env = getEnv();
  const db = getDatabase();
  const repositories = new SqliteRepositoryBundle(db);
  const transactions = new SqliteTransactionRunner(db);
  const clock = new SystemClock();
  const ids = new UuidGenerator();
  const metrics = new MetricsQueryRepository(db);
  const ai = new MoonCourierAiService(env, repositories, clock, ids);
  const initializeDemo = new InitializeDemoUseCase(repositories, transactions, clock);
  return {
    env,
    db,
    repositories,
    transactions,
    clock,
    ids,
    metrics,
    ai,
    useCases: {
      initializeDemo,
      resetDemo: new ResetDemoUseCase(initializeDemo),
      dashboard: new GetMissionDashboardUseCase(repositories),
      previewDispatch: new PreviewDispatchUseCase(repositories),
      chargeRover: new ChargeRoverUseCase(repositories, transactions, clock),
      repairRover: new RepairRoverUseCase(repositories, transactions, clock),
      launchDelivery: new LaunchDeliveryUseCase(repositories, transactions, clock, ids),
      askMissionControl: new AskMissionControlUseCase(ai),
      generateScenario: new GenerateScenarioUseCase(ai),
      listScenarios: new ListScenariosUseCase(repositories),
      activateScenario: new ActivateScenarioUseCase(repositories, transactions, clock, ids),
      analytics: new GetAnalyticsDashboardUseCase(repositories, clock),
      aiHistory: new GetAiRunHistoryUseCase(repositories),
      runComparison: new RunScenarioComparisonUseCase(repositories, clock, ids),
      ops: new GetOpsSummaryUseCase(repositories, metrics),
    },
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;

declare global {
  var __moonCourierContainer: AppContainer | undefined;
}

export function getAppContainer(): AppContainer {
  if (!globalThis.__moonCourierContainer) globalThis.__moonCourierContainer = createAppContainer();
  return globalThis.__moonCourierContainer;
}

export function ensureDemoInitialized(): AppContainer {
  const container = getAppContainer();
  if (container.env.DEMO_AUTO_SEED) container.useCases.initializeDemo.execute();
  return container;
}
