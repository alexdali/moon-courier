'use client';

import { useState } from 'react';
import type { AiRunHistoryDto } from '@/application/dto/ai-run-history';
import type { AnalyticsDashboardDto } from '@/application/dto/analytics-dashboard';
import { AiRunHistory } from '@/components/analytics/ai-run-history';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { useI18n } from '@/i18n/i18n-provider';

export function AnalyticsWorkspace({
  analytics,
  history,
}: {
  analytics: AnalyticsDashboardDto;
  history: AiRunHistoryDto;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<'analytics' | 'developer'>('analytics');
  return (
    <>
      <div className="analytics-tabs" role="tablist" aria-label={t('Mission analysis sections')}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'analytics'}
          className={tab === 'analytics' ? 'is-active' : ''}
          onClick={() => setTab('analytics')}
        >
          {t('Mission analysis')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'developer'}
          className={tab === 'developer' ? 'is-active' : ''}
          onClick={() => setTab('developer')}
        >
          {t('Developer mode')}
        </button>
      </div>
      {tab === 'analytics' ? (
        <AnalyticsDashboard initial={analytics} />
      ) : (
        <AiRunHistory initial={history} />
      )}
    </>
  );
}
