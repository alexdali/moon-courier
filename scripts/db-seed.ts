import { createAppContainer } from '@/infrastructure/composition/app-container';

const container = createAppContainer();
const missionId = container.useCases.initializeDemo.execute();
const dashboard = container.useCases.dashboard.execute(missionId);
console.log(`Seeded mission ${missionId}: ${dashboard.orders.length} orders, ${dashboard.rovers.length} rovers, ${dashboard.world.nodes.length} map nodes.`);
container.db.close();
