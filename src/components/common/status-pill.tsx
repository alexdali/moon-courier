import type { ReactNode } from 'react';

export function StatusPill({ tone = 'neutral', children }: { tone?: 'neutral' | 'cyan' | 'mint' | 'amber' | 'red' | 'violet'; children: ReactNode }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
