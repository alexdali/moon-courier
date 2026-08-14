import { createAppContainer } from '@/infrastructure/composition/app-container';

const container = createAppContainer();
const missionId = container.useCases.resetDemo.execute();
console.log(`Reset complete. Active mission: ${missionId}`);
container.db.close();
