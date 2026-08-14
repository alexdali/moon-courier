'use client';

import type { AnalyticsDashboardDto } from '@/application/dto/analytics-dashboard';
import { useI18n } from '@/i18n/i18n-provider';

export function ScenarioComparison({ items }: { items: AnalyticsDashboardDto['comparison'] }) {
  const { t } = useI18n();
  return <div className="comparison-card"><div className="chart-card__head"><div><small>{t('Counterfactual laboratory')}</small><strong>{t('Strategy comparison')}</strong></div></div><div className="comparison-grid">{items.map((item, index) => <article key={item.key} className={index === 1 ? 'is-best' : ''}><span>{t(item.label)}</span><strong>{Math.round(item.summary.successRate * 100)}%</strong><small>{t('mission success')}</small><div><span>{t('Median')}</span><b>{item.summary.medianFinalCredits.toFixed(0)} CR</b></div><div><span>{t('Completion')}</span><b>{Math.round(item.summary.meanCompletionRate * 100)}%</b></div></article>)}</div></div>;
}
