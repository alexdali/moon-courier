'use client';

import type { FailureBreakdownItem } from '@/domain/entities/analytics';
import { useI18n } from '@/i18n/i18n-provider';

export function FailureChart({ items }: { items: readonly FailureBreakdownItem[] }) {
  const { t } = useI18n();
  const max = Math.max(1, ...items.map((item) => item.count));
  return <div className="chart-card"><div className="chart-card__head"><div><small>{t('Operational losses')}</small><strong>{t('Failure breakdown')}</strong></div></div><div className="horizontal-bars">{items.length === 0 ? <p className="empty-copy">{t('No failed deliveries yet. The intentionally impossible order is still tracked as a blocker.')}</p> : items.map((item) => <div key={item.reason}><span>{t(item.reason)}</span><div><i style={{ width: `${(item.count / max) * 100}%` }}/></div><strong>{item.count}</strong></div>)}</div></div>;
}
