'use client';

import { useRouter } from 'next/navigation';
import type { AiRunHistoryDto, AiRunHistoryItemDto } from '@/application/dto/ai-run-history';
import { StatusPill } from '@/components/common/status-pill';
import { useI18n } from '@/i18n/i18n-provider';

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function messagesFrom(request: Record<string, unknown>): readonly Record<string, unknown>[] {
  return Array.isArray(request.messages)
    ? request.messages.filter(
        (item): item is Record<string, unknown> => typeof item === 'object' && item !== null,
      )
    : [];
}

function parametersFrom(request: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(request).filter(([key]) => key !== 'messages'));
}

function legacyPrompt(run: AiRunHistoryItemDto): string | null {
  if (!run.request || typeof run.request !== 'object') return null;
  const request = run.request as Record<string, unknown>;
  const value = request.message ?? request.prompt;
  return typeof value === 'string' ? value : null;
}

function statusTone(status: string): 'mint' | 'amber' | 'red' | 'neutral' {
  return status === 'succeeded'
    ? 'mint'
    : status === 'rejected'
      ? 'amber'
      : status === 'failed'
        ? 'red'
        : 'neutral';
}

export function AiRunHistory({ initial }: { initial: AiRunHistoryDto }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const number = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US');
  const date = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
  const dayDate = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  });

  return (
    <div className="developer-layout">
      <section className="developer-summary">
        <article>
          <span>{t('AI requests')}</span>
          <strong>{number.format(initial.totals.requestCount)}</strong>
        </article>
        <article>
          <span>{t('All tokens')}</span>
          <strong>{number.format(initial.totals.inputTokens + initial.totals.outputTokens)}</strong>
        </article>
        <article>
          <span>{t('Cached tokens')}</span>
          <strong>{number.format(initial.totals.cachedTokens)}</strong>
        </article>
        <article>
          <span>{t('All-time AI cost')}</span>
          <strong>${initial.totals.costUsd.toFixed(6)}</strong>
        </article>
        <button className="secondary-action" type="button" onClick={() => router.refresh()}>
          {t('Refresh history')}
        </button>
      </section>
      <section className="panel daily-costs">
        <header>
          <div>
            <span className="eyebrow">{t('AI cost by day')}</span>
            <h2>{t('Daily totals')}</h2>
          </div>
          <small>{t('Dates are grouped by UTC')}</small>
        </header>
        <div className="daily-cost-table">
          <div className="daily-cost-table__head">
            <span>{t('Date')}</span><span>{t('Requests')}</span><span>{t('Input / output')}</span><span>{t('Cached tokens')}</span><span>{t('Cost')}</span>
          </div>
          {initial.dailyCosts.map((day) => <div key={day.date}>
            <strong>{dayDate.format(new Date(`${day.date}T00:00:00Z`))}</strong>
            <span>{number.format(day.requestCount)}</span>
            <span>{number.format(day.inputTokens)} / {number.format(day.outputTokens)}</span>
            <span>{number.format(day.cachedTokens)}</span>
            <strong>${day.costUsd.toFixed(6)}</strong>
          </div>)}
        </div>
      </section>
      <section className="panel developer-history">
        <header>
          <div>
            <span className="eyebrow">{t('Provider request history')}</span>
            <h2>{t('OpenRouter request log')}</h2>
            <p>
              {t(
                'Stored model attempts, exact provider parameters and prompts. API keys are never recorded.',
              )}
            </p>
          </div>
          <small>
            {initial.runs.length} / {initial.totals.requestCount} {t('records')}
          </small>
        </header>
        <p className="developer-history__hint">{t('Open Full data on a request to see its prompt, model parameters and token details.')}</p>
        {initial.runs.length === 0 ? (
          <p className="empty-copy">{t('No AI requests have been saved yet.')}</p>
        ) : (
          <div className="developer-run-list">
            {initial.runs.map((run) => (
              <details className="developer-run" key={run.id}>
                <summary>
                  <span className="developer-run__time">
                    {date.format(new Date(run.createdAt))}
                  </span>
                  <strong>{t(run.requestType)}</strong>
                  <code>{run.model}</code>
                  <span>
                    {number.format(run.inputTokens)} → {number.format(run.outputTokens)}
                  </span>
                  <span>${run.costUsd.toFixed(6)}</span>
                  <StatusPill tone={statusTone(run.status)}>{t(run.status)}</StatusPill>
                  <span className="developer-run__open">{t('Full data')}</span>
                </summary>
                <div className="developer-run__body">
                  <dl className="developer-run__facts">
                    <div>
                      <dt>{t('Provider')}</dt>
                      <dd>{run.provider}</dd>
                    </div>
                    <div>
                      <dt>{t('Model')}</dt>
                      <dd>
                        <code>{run.model}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>{t('Model role')}</dt>
                      <dd>{t(run.modelRole)}</dd>
                    </div>
                    <div>
                      <dt>{t('Prompt version')}</dt>
                      <dd>
                        <code>{run.promptVersion}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>{t('Input tokens')}</dt>
                      <dd>{number.format(run.inputTokens)}</dd>
                    </div>
                    <div>
                      <dt>{t('Output tokens')}</dt>
                      <dd>{number.format(run.outputTokens)}</dd>
                    </div>
                    <div>
                      <dt>{t('Cached tokens')}</dt>
                      <dd>{number.format(run.cachedTokens)}</dd>
                    </div>
                    <div>
                      <dt>{t('Cache write tokens')}</dt>
                      <dd>{number.format(run.cacheWriteTokens)}</dd>
                    </div>
                    <div>
                      <dt>{t('Latency')}</dt>
                      <dd>
                        {number.format(run.latencyMs)} {t('ms')}
                      </dd>
                    </div>
                    <div>
                      <dt>{t('Cost')}</dt>
                      <dd>${run.costUsd.toFixed(6)}</dd>
                    </div>
                  </dl>
                  {run.errorMessage ? (
                    <div className="developer-error">
                      <strong>{run.errorCode}</strong>
                      <span>{run.errorMessage}</span>
                    </div>
                  ) : null}
                  {run.providerRequests.length > 0 ? (
                    run.providerRequests.map((request, index) => (
                      <section className="provider-request" key={`${run.id}-${index}`}>
                        <h3>
                          {t('Provider request')} #{index + 1}
                        </h3>
                        <div className="provider-request__grid">
                          <div>
                            <h4>{t('Prompt')}</h4>
                            <div className="prompt-messages">
                              {messagesFrom(request).map((message, messageIndex) => (
                                <article key={messageIndex}>
                                  <span>{t(String(message.role ?? 'message'))}</span>
                                  <pre>
                                    {typeof message.content === 'string'
                                      ? message.content
                                      : stringify(message.content)}
                                  </pre>
                                </article>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4>{t('Request parameters')}</h4>
                            <pre className="json-block">{stringify(parametersFrom(request))}</pre>
                          </div>
                        </div>
                      </section>
                    ))
                  ) : (
                    <section className="provider-request provider-request--legacy">
                      <h3>{t('Saved legacy request')}</h3>
                      <p>
                        {t(
                          'This record predates detailed provider logging. Available input data is shown below.',
                        )}
                      </p>
                      {legacyPrompt(run) ? (
                        <div>
                          <h4>{t('Prompt')}</h4>
                          <pre className="json-block">{legacyPrompt(run)}</pre>
                        </div>
                      ) : null}
                      <div>
                        <h4>{t('Request data')}</h4>
                        <pre className="json-block">{stringify(run.request)}</pre>
                      </div>
                    </section>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
