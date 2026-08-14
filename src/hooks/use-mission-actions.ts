'use client';

import { apiClient } from '@/client/api-client';
import { useMissionStore } from '@/stores/mission-store-provider';

export function useMissionActions() {
  const state = {
    missionId: useMissionStore((item) => item.dashboard.mission.id),
    orderId: useMissionStore((item) => item.selectedOrderId),
    roverId: useMissionStore((item) => item.selectedRoverId),
    objective: useMissionStore((item) => item.objective),
  };
  const setBusy = useMissionStore((item) => item.setBusy);
  const setError = useMissionStore((item) => item.setError);
  const setDashboard = useMissionStore((item) => item.setDashboard);
  const setDeliveryReplay = useMissionStore((item) => item.setDeliveryReplay);

  return {
    async launch() {
      if (!state.orderId || !state.roverId) return;
      setBusy('launch'); setError(null);
      try {
        const replay = await apiClient.launchDelivery({
          missionId: state.missionId,
          orderId: state.orderId,
          roverId: state.roverId,
          objective: state.objective,
          idempotencyKey: `ui-${state.missionId}-${state.orderId}-${state.roverId}-${Date.now()}`,
        });
        setDeliveryReplay(replay);
        const dashboard = await apiClient.mission();
        setTimeout(() => setDashboard(dashboard), Math.min(5_000, 1_600 + replay.events.length * 180));
      } catch (error) { setError(error instanceof Error ? error.message : String(error)); }
      finally { setBusy(null); }
    },
    async charge(roverId: string, targetBatteryPercent = 100) {
      setBusy('charge'); setError(null);
      try {
        await apiClient.chargeRover(roverId, { missionId: state.missionId, targetBatteryPercent });
        setDashboard(await apiClient.mission());
      } catch (error) { setError(error instanceof Error ? error.message : String(error)); }
      finally { setBusy(null); }
    },
    async repair(roverId: string) {
      setBusy('repair'); setError(null);
      try {
        await apiClient.repairRover(roverId, { missionId: state.missionId });
        setDashboard(await apiClient.mission());
      } catch (error) { setError(error instanceof Error ? error.message : String(error)); }
      finally { setBusy(null); }
    },
    async reset() {
      setBusy('reset'); setError(null);
      try { setDashboard(await apiClient.resetMission()); setDeliveryReplay(null); }
      catch (error) { setError(error instanceof Error ? error.message : String(error)); }
      finally { setBusy(null); }
    },
  };
}
