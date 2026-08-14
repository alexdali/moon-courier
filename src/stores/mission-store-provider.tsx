'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';
import { createMissionStore, type MissionStoreApi } from '@/stores/mission-store';

const Context = createContext<MissionStoreApi | null>(null);

export function MissionStoreProvider({ initial, children }: { initial: MissionDashboardDto; children: ReactNode }) {
  const [store] = useState(() => createMissionStore(initial));
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useMissionStore<T>(selector: (state: ReturnType<MissionStoreApi['getState']>) => T): T {
  const store = useContext(Context);
  if (!store) throw new Error('MissionStoreProvider is missing');
  return useStore(store, selector);
}
