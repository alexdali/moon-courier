'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { apiClient } from '@/client/api-client';
import { Icon } from '@/components/common/icon';
import { StatusPill } from '@/components/common/status-pill';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

const quickPrompts = [
  { label: 'Recommend', en: 'Recommend the safest critical dispatch while keeping 15% battery reserve.', ru: 'Рекомендуй самую безопасную критическую доставку с резервом батареи 15%.' },
  { label: 'Explain', en: 'Why is the selected dispatch impossible or risky?', ru: 'Почему выбранная доставка невозможна или рискованна?' },
  { label: 'Compare', en: 'Compare the current fleet with one additional heavy rover.', ru: 'Сравни текущий флот с вариантом, где добавлен один тяжёлый ровер.' },
] as const;

export function AiConsole() {
  const { locale, t } = useI18n();
  const dashboard = useMissionStore((state) => state.dashboard);
  const selectedOrderId = useMissionStore((state) => state.selectedOrderId);
  const selectedRoverId = useMissionStore((state) => state.selectedRoverId);
  const response = useMissionStore((state) => state.aiResponse);
  const setResponse = useMissionStore((state) => state.setAiResponse);
  const setBusy = useMissionStore((state) => state.setBusy);
  const setError = useMissionStore((state) => state.setError);
  const applySelection = useMissionStore((state) => state.applyAiSelection);
  const busy = useMissionStore((state) => state.busy);
  const [message, setMessage] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const responseRef = useRef<HTMLElement>(null);
  const isAiBusy = busy === 'ai';

  useEffect(() => {
    if (response) responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [response]);

  async function submit(value = message) {
    if (!value.trim()) return;
    setBusy('ai'); setError(null); setRequestError(null); setResponse(null);
    try {
      setResponse(await apiClient.askAi({
        missionId: dashboard.mission.id,
        message: value,
        ...(selectedOrderId ? { selectedOrderId } : {}),
        ...(selectedRoverId ? { selectedRoverId } : {}),
      }));
      setMessage('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRequestError(errorMessage); setError(errorMessage);
    }
    finally { setBusy(null); }
  }
  function onSubmit(event: FormEvent) { event.preventDefault(); void submit(); }

  return <section className="ai-console">
    <div className="section-label"><span><Icon name="spark" size={14}/>{t('Mission Control AI')}</span><StatusPill tone={response?.mode === 'deterministic' ? 'neutral' : 'cyan'}>{isAiBusy ? t('Analyzing') : response?.mode === 'deterministic' ? t('offline') : response?.model ?? (dashboard.ai.mode === 'online' ? 'DeepSeek → Luna' : t('offline'))}</StatusPill></div>
    <div className="quick-prompts">{quickPrompts.map((item) => <button type="button" key={item.label} onClick={() => void submit(item[locale])} disabled={isAiBusy}>{t(item.label)}</button>)}</div>
    {isAiBusy ? <div className="ai-loading" role="status" aria-live="polite"><span aria-hidden="true"/>{t('AI is analyzing…')}</div> : null}
    {requestError ? <div className="inline-error" role="alert"><Icon name="alert" size={15}/>{t(requestError)}</div> : null}
    {response ? <article className="ai-response" ref={responseRef} aria-live="polite">
      <div className="ai-response__meta"><span>{response.model ?? t('Offline rules')}</span>{response.fallbackUsed ? <StatusPill tone="violet">{t('Luna fallback')}</StatusPill> : null}</div>
      {response.mode === 'deterministic' ? <div className="ai-degraded-notice">{t('Models unavailable — showing deterministic calculation.')}</div> : null}
      <p>{t(response.answer)}</p>
      {response.toolCalls.length ? <details><summary>{t('Used')} {response.toolCalls.length} {t(response.toolCalls.length === 1 ? 'deterministic tool' : 'deterministic tools')}</summary>{response.toolCalls.map((call, index) => <div className="tool-call" key={`${call.name}-${index}`}><code>{t(call.name)}</code><span>{t(call.resultSummary)}</span></div>)}</details> : null}
      {response.suggestedSelection ? <button type="button" className="secondary-action" onClick={applySelection}>{t('Apply recommendation')} <Icon name="arrow" size={14}/></button> : null}
    </article> : <div className="ai-placeholder"><Icon name="spark" size={22}/><p>{t('Ask for a plan, blocker explanation or counterfactual simulation.')}</p></div>}
    <form className="ai-input" onSubmit={onSubmit}><input value={message} onChange={(event: ChangeEvent<HTMLInputElement>) => setMessage(event.target.value)} placeholder={t('Ask Mission Control…')}/><button type="submit" disabled={isAiBusy || message.trim().length < 2}>{isAiBusy ? '…' : <Icon name="arrow" size={17}/>}</button></form>
  </section>;
}
