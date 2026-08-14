'use client';

import type { EconomyPoint } from '@/domain/entities/analytics';
import { useI18n } from '@/i18n/i18n-provider';

export function EconomyChart({ points }: { points: readonly EconomyPoint[] }) {
  const { t } = useI18n();
  const data = points.length > 1 ? points : [{ sequence: 1, label: t('Start'), balance: points[0]?.balance ?? 0, delta: 0 }, { sequence: 2, label: t('Now'), balance: points[0]?.balance ?? 0, delta: 0 }];
  const values = data.map((point) => point.balance);
  const min = Math.min(...values); const max = Math.max(...values); const span = Math.max(1, max - min);
  const coords = data.map((point, index) => ({
    x: 6 + (index / Math.max(1, data.length - 1)) * 88,
    y: 88 - ((point.balance - min) / span) * 72,
    point,
  }));
  return <div className="chart-card"><div className="chart-card__head"><div><small>{t('Economy over time')}</small><strong>{t('Balance trajectory')}</strong></div><span>{min.toFixed(0)}–{max.toFixed(0)} CR</span></div><svg className="economy-chart" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="economyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42d9ff" stopOpacity=".32"/><stop offset="1" stopColor="#42d9ff" stopOpacity="0"/></linearGradient></defs><g stroke="#243746" strokeWidth=".4">{[20,40,60,80].map((y) => <line key={y} x1="4" y1={y} x2="96" y2={y}/>)}</g><path d={`M ${coords.map(({ x, y }) => `${x} ${y}`).join(' L ')} L 94 92 L 6 92 Z`} fill="url(#economyFill)"/><polyline points={coords.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke="#42d9ff" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/>{coords.map(({ x, y, point }) => <g key={point.sequence}><circle cx={x} cy={y} r="1.2" fill={point.delta < 0 ? '#ff5c73' : '#63e7b2'}/></g>)}</svg><div className="chart-axis"><span>{data[0]?.label}</span><span>{data.at(-1)?.label}</span></div></div>;
}
