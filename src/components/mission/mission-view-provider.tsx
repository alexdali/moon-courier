'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';

export type MissionViewMode = 'simple' | 'detailed';

const STORAGE_KEY = 'moon-courier-view-mode';
const VIEW_EVENT = 'moon-courier-view-mode-change';
const MissionViewContext = createContext<{
  mode: MissionViewMode;
  setMode: (mode: MissionViewMode) => void;
} | null>(null);

export function MissionViewProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    (callback) => {
      const notify = () => callback();
      window.addEventListener('storage', notify);
      window.addEventListener(VIEW_EVENT, notify);
      return () => {
        window.removeEventListener('storage', notify);
        window.removeEventListener(VIEW_EVENT, notify);
      };
    },
    (): MissionViewMode => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === 'detailed' ? 'detailed' : 'simple';
    },
    (): MissionViewMode => 'simple',
  );

  useEffect(() => {
    document.documentElement.dataset.missionView = mode;
    return () => { delete document.documentElement.dataset.missionView; };
  }, [mode]);

  const setMode = useCallback((next: MissionViewMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(VIEW_EVENT));
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <MissionViewContext.Provider value={value}>{children}</MissionViewContext.Provider>;
}

export function useMissionView() {
  const context = useContext(MissionViewContext);
  if (!context) throw new Error('MissionViewProvider is missing');
  return context;
}
