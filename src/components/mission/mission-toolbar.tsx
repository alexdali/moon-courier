'use client';

import Link from 'next/link';
import { Icon } from '@/components/common/icon';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ProgressBar } from '@/components/common/progress-bar';
import { StatusPill } from '@/components/common/status-pill';
import { useMissionActions } from '@/hooks/use-mission-actions';
import { minutesToClock } from '@/lib/time';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';
import { useMissionView } from '@/components/mission/mission-view-provider';

export function MissionToolbar() {
  const { t } = useI18n();
  const { mode, theme, setMode, setTheme } = useMissionView();
  const dashboard = useMissionStore((state) => state.dashboard);
  const busy = useMissionStore((state) => state.busy);
  const { reset } = useMissionActions();
  const mission = dashboard.mission;
  return <div className="mission-toolbar">
    <div className="mission-title"><span className="mission-title__mark"><Icon name="moon" size={21}/></span><div><small><span>{t('MOON COURIER')}</span><span className="mission-title__difficulty"> · {t(`scenario.${dashboard.scenario.difficulty}`)}</span></small><strong>{t(dashboard.scenario.name)}</strong></div></div>
    <div className="mission-clock"><span>{t('DAY')} {String(mission.currentDay).padStart(2, '0')}</span><strong>{minutesToClock(mission.currentMinute)}</strong><StatusPill tone={mission.status === 'active' ? 'mint' : mission.status === 'completed' ? 'cyan' : 'red'}>{t(mission.status)}</StatusPill></div>
    <div className="mission-goal"><div><span>{mission.credits.toFixed(0)} {t('CR')}</span><small> / {mission.targetCredits.toFixed(0)} {t('target')}</small></div><ProgressBar value={dashboard.goal.progressPercent} tone={dashboard.goal.state === 'lost' ? 'red' : dashboard.goal.state === 'won' ? 'mint' : 'cyan'}/></div>
    <div className="mission-toolbar__actions"><div className="view-switcher" role="group" aria-label={t('Interface version')}><button type="button" className={mode === 'simple' ? 'is-active' : ''} aria-pressed={mode === 'simple'} onClick={() => setMode('simple')}>{t('Simple')}</button><button type="button" className={mode === 'detailed' ? 'is-active' : ''} aria-pressed={mode === 'detailed'} onClick={() => setMode('detailed')}>{t('Detailed')}</button></div><div className="theme-switcher" role="group" aria-label={t('Color theme')}><button type="button" className={theme === 'light' ? 'is-active' : ''} aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>{t('Light')}</button><button type="button" className={theme === 'dark' ? 'is-active' : ''} aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>{t('Dark')}</button></div><LocaleSwitcher/><Link href="/analytics" className="icon-button" title={t('Mission debrief')}><Icon name="chart"/></Link><Link href="/analytics?tab=developer" className="developer-mode-link"><Icon name="spark" size={14}/><span>{t('AI log')}</span></Link><button className="icon-button" type="button" title={t('Reset demo')} onClick={() => void reset()} disabled={busy === 'reset'}><Icon name="reset"/></button></div>
  </div>;
}
