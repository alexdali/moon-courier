'use client';

import { RoverCard } from '@/components/mission/rover-card';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function RoverList() {
  const { t } = useI18n();
  const rovers = useMissionStore((state) => state.dashboard.rovers);
  return <section className="rover-section"><div className="section-label"><span>{t('Fleet')}</span><small>{rovers.filter((rover) => rover.status === 'available').length} {t('available count')}</small></div><div className="rover-list">{rovers.map((rover) => <RoverCard key={rover.id} rover={rover}/>)}</div></section>;
}
