'use client';

import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';
import { AiConsole } from '@/components/mission/ai-console';
import { DeliveryResult } from '@/components/mission/delivery-result';
import { DispatchPreviewPanel } from '@/components/mission/dispatch-preview-panel';
import { EventTimeline } from '@/components/mission/event-timeline';
import { LunarMap } from '@/components/mission/lunar-map';
import { MissionToolbar } from '@/components/mission/mission-toolbar';
import { MissionViewProvider, useMissionView } from '@/components/mission/mission-view-provider';
import { OrderList } from '@/components/mission/order-list';
import { RoverList } from '@/components/mission/rover-list';
import { useDispatchPreview } from '@/hooks/use-dispatch-preview';
import { useI18n } from '@/i18n/i18n-provider';
import { MissionStoreProvider } from '@/stores/mission-store-provider';

export function MissionControl({ initialDashboard }: { initialDashboard: MissionDashboardDto }) {
  return <MissionStoreProvider initial={initialDashboard}><MissionViewProvider><MissionControlInner/></MissionViewProvider></MissionStoreProvider>;
}

function MissionControlInner() {
  useDispatchPreview();
  const { t } = useI18n();
  const { mode } = useMissionView();
  return <main className={`mission-app mission-app--${mode}`}>
    <MissionToolbar/>
    {mode === 'simple' ? <div className="mission-grid mission-grid--simple">
        <OrderList/>
        <div className="mission-center mission-center--simple">
          <LunarMap/>
          <div className="mission-simple-tools">
            <details><summary><span aria-hidden="true">＋</span>{t('Mission events')}</summary><EventTimeline/></details>
            <details><summary><span aria-hidden="true">＋</span>{t('AI assistant')}</summary><AiConsole/></details>
          </div>
        </div>
        <aside className="mission-panel mission-panel--right"><RoverList/><DispatchPreviewPanel/></aside>
      </div> : <div className="mission-grid">
        <OrderList/>
        <div className="mission-center"><LunarMap/><EventTimeline/></div>
        <aside className="mission-panel mission-panel--right"><RoverList/><DispatchPreviewPanel/><AiConsole/></aside>
      </div>}
    <DeliveryResult/>
  </main>;
}
