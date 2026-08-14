'use client';

import { create } from 'zustand';
import type { AiAssistantResponseDto } from '@/application/dto/ai-assistant';
import type { DeliveryReplayDto } from '@/application/dto/delivery-replay';
import type { DispatchPreviewDto } from '@/application/dto/dispatch-preview';
import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';

interface MissionStore {
  dashboard: MissionDashboardDto;
  selectedOrderId: string | null;
  selectedRoverId: string | null;
  objective: 'balanced' | 'fastest' | 'safest' | 'efficient';
  preview: DispatchPreviewDto | null;
  aiResponse: AiAssistantResponseDto | null;
  deliveryReplay: DeliveryReplayDto | null;
  busy: 'preview' | 'launch' | 'charge' | 'repair' | 'ai' | 'reset' | null;
  error: string | null;
  setDashboard(value: MissionDashboardDto): void;
  selectOrder(id: string): void;
  selectRover(id: string): void;
  setObjective(value: MissionStore['objective']): void;
  setPreview(value: DispatchPreviewDto | null): void;
  setAiResponse(value: AiAssistantResponseDto | null): void;
  setDeliveryReplay(value: DeliveryReplayDto | null): void;
  setBusy(value: MissionStore['busy']): void;
  setError(value: string | null): void;
  applyAiSelection(): void;
  clearSelection(): void;
}

export function createMissionStore(initial: MissionDashboardDto) {
  return create<MissionStore>((set, get) => ({
    dashboard: initial,
    selectedOrderId: initial.orders.find((order) => order.status === 'pending')?.id ?? null,
    selectedRoverId: initial.rovers.find((rover) => rover.status === 'available')?.id ?? null,
    objective: 'balanced',
    preview: null,
    aiResponse: null,
    deliveryReplay: null,
    busy: null,
    error: null,
    setDashboard: (dashboard) => set({ dashboard }),
    selectOrder: (selectedOrderId) => set({ selectedOrderId, preview: null, deliveryReplay: null, error: null }),
    selectRover: (selectedRoverId) => set({ selectedRoverId, preview: null, deliveryReplay: null, error: null }),
    setObjective: (objective) => set({ objective, preview: null }),
    setPreview: (preview) => set({ preview }),
    setAiResponse: (aiResponse) => set({ aiResponse }),
    setDeliveryReplay: (deliveryReplay) => set({ deliveryReplay }),
    setBusy: (busy) => set({ busy }),
    setError: (error) => set({ error }),
    applyAiSelection: () => {
      const selection = get().aiResponse?.suggestedSelection;
      if (selection) set({ selectedOrderId: selection.orderId, selectedRoverId: selection.roverId, preview: null });
    },
    clearSelection: () => set({ selectedOrderId: null, selectedRoverId: null, preview: null }),
  }));
}

export type MissionStoreApi = ReturnType<typeof createMissionStore>;
