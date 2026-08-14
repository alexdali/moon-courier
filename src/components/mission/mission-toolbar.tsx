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

export function MissionToolbar() {
  const { t } = useI18n();
  const dashboard = useMissionStore((state) => state.dashboard);
  const busy = useMissionStore((state) => state.busy);
  const { reset } = useMissionActions();
  const mission = dashboard.mission;
  return <div className="mission-toolbar">
    <div className="mission-title"><span className="mission-title__mark"><Icon name="moon" size={21}/></span><div><small>MOON COURIER · {t(`scenario.${dashboard.scenario.difficulty}`)}</small><strong>{dashboard.scenario.name}</strong></div></div>
    <div className="mission-clock"><span>{t('DAY')} {String(mission.currentDay).padStart(2, '0')}</span><strong>{minutesToClock(mission.currentMinute)}</strong><StatusPill tone={mission.status === 'active' ? 'mint' : mission.status === 'completed' ? 'cyan' : 'red'}>{t(mission.status)}</StatusPill></div>
    <div className="mission-goal"><div><span>{mission.credits.toFixed(0)} CR</span><small> / {mission.targetCredits.toFixed(0)} {t('target')}</small></div><ProgressBar value={dashboard.goal.progressPercent} tone={dashboard.goal.state === 'lost' ? 'red' : dashboard.goal.state === 'won' ? 'mint' : 'cyan'}/></div>
    <div className="mission-toolbar__actions"><LocaleSwitcher/><Link href="/analytics" className="icon-button" title={t('Mission debrief')}><Icon name="chart"/></Link><button className="icon-button" type="button" title={t('Reset demo')} onClick={() => void reset()} disabled={busy === 'reset'}><Icon name="reset"/></button></div>
  </div>;
}
