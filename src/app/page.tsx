import { MissionControl } from '@/components/mission/mission-control';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const container = ensureDemoInitialized();
  return <MissionControl initialDashboard={container.useCases.dashboard.execute()}/>;
}
