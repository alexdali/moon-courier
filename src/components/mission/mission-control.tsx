'use client';

import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';
import { AiConsole } from '@/components/mission/ai-console';
import { DeliveryResult } from '@/components/mission/delivery-result';
import { DispatchPreviewPanel } from '@/components/mission/dispatch-preview-panel';
import { EventTimeline } from '@/components/mission/event-timeline';
import { LunarMap } from '@/components/mission/lunar-map';
import { MissionToolbar } from '@/components/mission/mission-toolbar';
import { OrderList } from '@/components/mission/order-list';
import { RoverList } from '@/components/mission/rover-list';
import { useDispatchPreview } from '@/hooks/use-dispatch-preview';
import { MissionStoreProvider } from '@/stores/mission-store-provider';

export function MissionControl({ initialDashboard }: { initialDashboard: MissionDashboardDto }) {
  return <MissionStoreProvider initial={initialDashboard}><MissionControlInner/></MissionStoreProvider>;
}

function MissionControlInner() {
  useDispatchPreview();
  return <main className="mission-app">
    <MissionToolbar/>
    <div className="mission-grid">
      <OrderList/>
      <div className="mission-center"><LunarMap/><EventTimeline/></div>
      <aside className="mission-panel mission-panel--right"><RoverList/><DispatchPreviewPanel/><AiConsole/></aside>
    </div>
    <DeliveryResult/>
  </main>;
}
