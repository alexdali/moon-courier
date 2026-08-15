'use client';

import { useState } from 'react';
import type { AnalyticsDashboardDto } from '@/application/dto/analytics-dashboard';
import { apiClient } from '@/client/api-client';
import { Icon } from '@/components/common/icon';
import { EconomyChart } from '@/components/analytics/economy-chart';
import { FailureChart } from '@/components/analytics/failure-chart';
import { ScenarioComparison } from '@/components/analytics/scenario-comparison';
import { UtilizationChart } from '@/components/analytics/utilization-chart';
import { useI18n } from '@/i18n/i18n-provider';

export function AnalyticsDashboard({ initial }: { initial: AnalyticsDashboardDto }) {
  const { t } = useI18n();
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function rerun() {
    setBusy(true);
    try { await apiClient.runSimulation(300); setData(await apiClient.analytics(150)); }
    finally { setBusy(false); }
  }
  const best = [...data.comparison].sort((a, b) => b.summary.successRate - a.summary.successRate)[0];
  const baseline = data.comparison.find((item) => item.key === 'baseline');
  return <div className="analytics-layout">
    <div className="kpi-grid">
      <article><span>{t('Total credits')}</span><strong>{data.kpis.credits.toFixed(0)} {t('CR')}</strong><small className={data.kpis.netChange >= 0 ? 'text-mint' : 'text-red'}>{data.kpis.netChange >= 0 ? '+' : ''}{data.kpis.netChange.toFixed(0)} {t('from start')}</small></article>
      <article><span>{t('Completion')}</span><strong>{Math.round(data.kpis.completionRate * 100)}%</strong><small>{data.kpis.deliveredOrders} {t('delivered orders')}</small></article>
      <article><span>{t('Failures')}</span><strong>{data.kpis.failedDeliveries}</strong><small>{data.kpis.blockedOrders} {t('blocked orders')}</small></article>
      <article><span>{t('Fleet utilization')}</span><strong>{Math.round(data.kpis.averageRoverUtilization * 100)}%</strong><small>{t('moving time share')}</small></article>
    </div>
    <div className="analytics-grid"><EconomyChart points={data.economy}/><FailureChart items={data.failures}/><UtilizationChart items={data.roverUtilization}/><ScenarioComparison items={data.comparison}/></div>
    <section className="insight-card"><span className="insight-card__icon"><Icon name="spark" size={23}/></span><div><span className="eyebrow">{t('Computed insight')}</span><h2>{t(best?.key === 'extra-heavy-rover' ? 'Heavy-load capacity is the leading bottleneck.' : 'The best intervention depends on current mission state.')}</h2><p>{best && baseline ? `${t(best.label)}: ${Math.round(best.summary.successRate * 100)}% / ${Math.round(baseline.summary.successRate * 100)}%` : t('Run the counterfactual simulation to compare options.')}</p><small>{t('Evidence')}: {data.evidence.eventCount} {t('events')} · {data.evidence.deliveryCount} {t('deliveries')} · {data.evidence.simulationIterations} {t('simulation runs')}</small></div><button className="secondary-action" type="button" onClick={() => void rerun()} disabled={busy}><Icon name="reset" size={15}/>{t(busy ? 'Running 300 simulations…' : 'Run deeper simulation')}</button></section>
  </div>;
}
