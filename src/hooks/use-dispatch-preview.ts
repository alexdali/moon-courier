'use client';

import { useEffect } from 'react';
import { apiClient } from '@/client/api-client';
import { useMissionStore } from '@/stores/mission-store-provider';

export function useDispatchPreview(): void {
  const missionId = useMissionStore((state) => state.dashboard.mission.id);
  const orderId = useMissionStore((state) => state.selectedOrderId);
  const roverId = useMissionStore((state) => state.selectedRoverId);
  const objective = useMissionStore((state) => state.objective);
  const setPreview = useMissionStore((state) => state.setPreview);
  const setBusy = useMissionStore((state) => state.setBusy);
  const setError = useMissionStore((state) => state.setError);

  useEffect(() => {
    if (!orderId || !roverId) { setPreview(null); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy('preview');
      apiClient.previewDispatch({ missionId, orderId, roverId, objective })
        .then((preview) => { if (!controller.signal.aborted) setPreview(preview); })
        .catch((error: unknown) => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : String(error)); })
        .finally(() => { if (!controller.signal.aborted) setBusy(null); });
    }, 140);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [missionId, objective, orderId, roverId, setBusy, setError, setPreview]);
}
