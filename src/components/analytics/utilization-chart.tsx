'use client';

import type { RoverUtilizationItem } from '@/domain/entities/analytics';
import { useI18n } from '@/i18n/i18n-provider';

export function UtilizationChart({ items }: { items: readonly RoverUtilizationItem[] }) {
  const { t } = useI18n();
  return <div className="chart-card"><div className="chart-card__head"><div><small>{t('Fleet capacity')}</small><strong>{t('Rover utilization')}</strong></div><span className="mini-legend"><i className="moving"/>{t('moving')} <i className="idle"/>{t('idle')}</span></div><div className="utilization-bars">{items.map((item) => <div key={item.roverId}><strong>{item.roverCode}</strong><div className="stacked-bar"><i className="stacked-bar__moving" style={{ width: `${item.movingPercent * 100}%` }}/><i className="stacked-bar__charging" style={{ width: `${item.chargingPercent * 100}%` }}/><i className="stacked-bar__damaged" style={{ width: `${item.damagedPercent * 100}%` }}/><i className="stacked-bar__idle" style={{ width: `${item.idlePercent * 100}%` }}/></div><span>{Math.round(item.movingPercent * 100)}%</span></div>)}</div></div>;
}
