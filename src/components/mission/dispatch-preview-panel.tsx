'use client';

import { Icon } from '@/components/common/icon';
import { ProgressBar } from '@/components/common/progress-bar';
import { StatusPill } from '@/components/common/status-pill';
import { useMissionActions } from '@/hooks/use-mission-actions';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function DispatchPreviewPanel() {
  const { t } = useI18n();
  const preview = useMissionStore((state) => state.preview);
  const objective = useMissionStore((state) => state.objective);
  const setObjective = useMissionStore((state) => state.setObjective);
  const busy = useMissionStore((state) => state.busy);
  const error = useMissionStore((state) => state.error);
  const { launch } = useMissionActions();
  const status = preview?.feasibility.status ?? null;
  return <section className="dispatch-section">
    <div className="section-label"><span>{t('Dispatch preview')}</span><small>{t('deterministic engine')}</small></div>
    <div className="objective-select">{(['balanced', 'fastest', 'safest', 'efficient'] as const).map((value) => <button key={value} type="button" className={objective === value ? 'is-active' : ''} onClick={() => setObjective(value)}>{t(value)}</button>)}</div>
    {!preview ? <div className="dispatch-empty"><Icon name="route" size={26}/><p>{t('Select an order and a rover to calculate route, battery, risk and economy.')}</p>{busy === 'preview' ? <span>{t('Calculating…')}</span> : null}</div> : <div className={`dispatch-preview dispatch-preview--${status}`}>
      <div className="dispatch-preview__head"><div><small>{preview.orderCode} → {preview.roverCode}</small><strong>{t(status === 'ready' ? 'Ready to dispatch' : status === 'warning' ? 'High-risk dispatch' : 'Dispatch impossible')}</strong></div><StatusPill tone={status === 'ready' ? 'mint' : status === 'warning' ? 'amber' : 'red'}>{status ? t(status) : ''}</StatusPill></div>
      <div className="dispatch-grid">
        <span><small>{t('Distance')}</small><strong>{preview.route?.distanceKm.toFixed(1) ?? '—'} km</strong></span>
        <span><small>{t('ETA')}</small><strong>{preview.route?.durationMinutes.toFixed(0) ?? '—'} min</strong></span>
        <span><small>{t('Route risk')}</small><strong>{preview.route ? `${Math.round(preview.route.incidentRisk * 100)}%` : '—'}</strong></span>
        <span><small>{t('Expected net')}</small><strong className={(preview.economy?.expectedNetCredits ?? 0) >= 0 ? 'text-mint' : 'text-red'}>{preview.economy ? `${preview.economy.expectedNetCredits > 0 ? '+' : ''}${preview.economy.expectedNetCredits.toFixed(0)} CR` : '—'}</strong></span>
      </div>
      <ProgressBar value={Math.max(0, preview.feasibility.batteryAfterPercent)} tone={preview.feasibility.batteryAfterPercent < 20 ? 'red' : preview.feasibility.batteryAfterPercent < 35 ? 'amber' : 'mint'} label={`${Math.max(0, preview.feasibility.batteryAfterPercent).toFixed(1)}% ${t('battery after')}`}/>
      {preview.feasibility.blockingReasons.length > 0 ? <div className="reason-list reason-list--blocking">{preview.feasibility.blockingReasons.map((reason) => <div key={`${reason.code}-${reason.message}`}><Icon name="alert" size={14}/><span>{t(reason.message)}</span></div>)}</div> : null}
      {preview.feasibility.warnings.length > 0 ? <div className="reason-list">{preview.feasibility.warnings.map((reason) => <div key={`${reason.code}-${reason.message}`}><Icon name="shield" size={14}/><span>{t(reason.message)}</span></div>)}</div> : null}
      <button className="primary-action" type="button" onClick={launch} disabled={status === 'impossible' || busy === 'launch'}><Icon name="play" size={17}/>{t(busy === 'launch' ? 'Resolving delivery…' : 'Launch delivery')}</button>
    </div>}
    {error ? <div className="inline-error"><Icon name="alert" size={15}/>{error}</div> : null}
  </section>;
}
