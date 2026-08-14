import { resolve } from 'node:path';
import { createAppContainer } from '@/infrastructure/composition/app-container';
import { writeJson } from './lib/files';
import { reportsDir } from './lib/project-paths';

const container = createAppContainer();
const missionId = container.useCases.initializeDemo.execute();
writeJson(resolve(reportsDir, 'demo-export.json'), {
  dashboard: container.useCases.dashboard.execute(missionId),
  analytics: container.useCases.analytics.execute(missionId, 100),
  snapshots: container.repositories.snapshots.list(missionId),
  deliveries: container.repositories.deliveries.listByMission(missionId),
  economy: container.repositories.economy.listByMission(missionId),
});
console.log('Saved reports/demo-export.json');
container.db.close();
