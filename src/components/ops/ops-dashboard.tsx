'use client';

import type { OpsSummaryDto } from '@/application/dto/ops-summary';
import { Icon } from '@/components/common/icon';
import { StatusPill } from '@/components/common/status-pill';
import { useI18n } from '@/i18n/i18n-provider';

export function OpsDashboard({ data }: { data: OpsSummaryDto }) {
  const { t } = useI18n();
  return <div className="ops-layout">
    <section className="ops-cards">{Object.entries(data.database).map(([key, value]) => <article key={key}><Icon name="database" size={18}/><span>{t(key.replace(/([A-Z])/g, ' $1'))}</span><strong>{value}</strong></article>)}</section>
    <div className="ops-grid"><section className="panel"><div className="section-label"><span>{t('AI routing')}</span><StatusPill tone={data.ai.enabled ? 'mint' : 'neutral'}>{t(data.ai.enabled ? 'online' : 'offline')}</StatusPill></div><dl className="definition-list"><div><dt>{t('Primary')}</dt><dd><code>{data.ai.primaryModel}</code></dd></div><div><dt>{t('Fallback')}</dt><dd><code>{data.ai.fallbackModel}</code></dd></div><div><dt>{t('Cost today')}</dt><dd>${data.ai.costTodayUsd.toFixed(4)}</dd></div></dl><p className="ops-note">{t('Fallback is explicit in application code, so every failed DeepSeek attempt and every Luna recovery can be audited separately.')}</p></section><section className="panel"><div className="section-label"><span>{t('Runtime')}</span><Icon name="settings" size={15}/></div><dl className="definition-list"><div><dt>Node.js</dt><dd>{data.runtime.node}</dd></div><div><dt>{t('Environment')}</dt><dd>{t(data.runtime.environment)}</dd></div><div><dt>{t('Database')}</dt><dd><code>{data.runtime.databasePath}</code></dd></div></dl></section></div>
    <section className="panel"><div className="section-label"><span>{t('Recent AI runs')}</span><small>{data.ai.recentRuns.length} {t('audit records')}</small></div><div className="ops-table"><div className="ops-table__head"><span>{t('Request')}</span><span>{t('Model')}</span><span>{t('Role')}</span><span>{t('Status')}</span><span>{t('Tokens')}</span><span>{t('Latency')}</span><span>{t('Cost')}</span></div>{data.ai.recentRuns.length === 0 ? <p className="empty-copy">{t('No AI calls have been made. Add an OpenRouter key and use Mission Control or Scenario Architect.')}</p> : data.ai.recentRuns.map((run, index) => <div key={String(run.id ?? index)}><span>{t(String(run.request_type ?? ''))}</span><code>{String(run.model ?? '')}</code><span>{t(String(run.model_role ?? ''))}</span><StatusPill tone={run.status === 'succeeded' ? 'mint' : run.status === 'rejected' ? 'amber' : 'red'}>{t(String(run.status ?? ''))}</StatusPill><span>{Number(run.input_tokens ?? 0) + Number(run.output_tokens ?? 0)}</span><span>{String(run.latency_ms ?? 0)} {t('ms')}</span><span>${Number(run.cost_usd ?? 0).toFixed(4)}</span></div>)}</div></section>
  </div>;
}
