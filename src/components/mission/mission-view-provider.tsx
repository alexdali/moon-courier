'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';

export type MissionViewMode = 'simple' | 'detailed';
export type MissionTheme = 'light' | 'dark';

const VIEW_STORAGE_KEY = 'moon-courier-view-mode';
const THEME_STORAGE_KEY = 'moon-courier-theme';
const VIEW_EVENT = 'moon-courier-view-mode-change';
const THEME_EVENT = 'moon-courier-theme-change';
const MissionViewContext = createContext<{
  mode: MissionViewMode;
  theme: MissionTheme;
  setMode: (mode: MissionViewMode) => void;
  setTheme: (theme: MissionTheme) => void;
} | null>(null);

function subscribeTo(eventName: string, callback: () => void) {
  const notify = () => callback();
  window.addEventListener('storage', notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(eventName, notify);
  };
}

export function MissionViewProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    (callback) => subscribeTo(VIEW_EVENT, callback),
    (): MissionViewMode => {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      return stored === 'detailed' ? 'detailed' : 'simple';
    },
    (): MissionViewMode => 'simple',
  );
  const theme = useSyncExternalStore(
    (callback) => subscribeTo(THEME_EVENT, callback),
    (): MissionTheme => window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light',
    (): MissionTheme => 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.missionView = mode;
    document.documentElement.dataset.missionTheme = theme;
    return () => {
      delete document.documentElement.dataset.missionView;
      delete document.documentElement.dataset.missionTheme;
    };
  }, [mode, theme]);

  const setMode = useCallback((next: MissionViewMode) => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    window.dispatchEvent(new Event(VIEW_EVENT));
  }, []);
  const setTheme = useCallback((next: MissionTheme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const value = useMemo(() => ({ mode, theme, setMode, setTheme }), [mode, theme, setMode, setTheme]);
  return <MissionViewContext.Provider value={value}>{children}</MissionViewContext.Provider>;
}

export function useMissionView() {
  const context = useContext(MissionViewContext);
  if (!context) throw new Error('MissionViewProvider is missing');
  return context;
}
