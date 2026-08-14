'use client';

import { Icon } from '@/components/common/icon';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function EventTimeline() {
  const { t } = useI18n();
  const persisted = useMissionStore((state) => state.dashboard.events);
  const replay = useMissionStore((state) => state.deliveryReplay);
  const combined = [...persisted, ...(replay?.events ?? []).filter((event) => !persisted.some((item) => item.id === event.id))].sort((left, right) => left.sequence - right.sequence).slice(-12);
  return <section className="event-timeline"><header><span><Icon name="database" size={14}/>{t('Event stream')}</span><small>{persisted.length} {t('persisted')}</small></header><div className="event-list">{combined.length === 0 ? <p className="empty-copy">{t('Launch a delivery to populate the audit timeline.')}</p> : combined.map((event) => <div key={event.id} className={`event-row event-row--${event.severity}`} style={{ animationDelay: `${Math.min(1_800, event.simulationOffsetMs)}ms` }}><span className="event-row__sequence">{String(event.sequence).padStart(3, '0')}</span><span className="event-row__dot"/><span><strong>{t(event.title)}</strong><small>{t(event.message)}</small></span></div>)}</div></section>;
}
