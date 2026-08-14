import { createAppContainer } from '@/infrastructure/composition/app-container';
import { printJson } from './lib/cli';

const container = createAppContainer();
container.useCases.initializeDemo.execute();
const mission = container.repositories.missions.getCurrent();
printJson({
  databasePath: container.env.DATABASE_PATH,
  counts: container.metrics.counts(),
  currentMission: mission,
  recentAiRuns: container.repositories.aiAudit.listRecent(10),
  recentSimulations: container.repositories.simulations.listRecent(5),
  foreignKeyViolations: container.db.pragma('foreign_key_check'),
  migrations: container.db.prepare('SELECT name, applied_at FROM schema_migrations ORDER BY name').all(),
});
container.db.close();
