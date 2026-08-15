'use client';

import type { DeliveryOrder } from '@/domain/entities/order';
import { Icon } from '@/components/common/icon';
import { StatusPill } from '@/components/common/status-pill';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

const urgencyTone = { low: 'neutral', normal: 'cyan', high: 'amber', critical: 'red' } as const;

export function OrderCard({ order, destination }: { order: DeliveryOrder; destination: string }) {
  const { t } = useI18n();
  const selected = useMissionStore((state) => state.selectedOrderId === order.id);
  const selectOrder = useMissionStore((state) => state.selectOrder);
  const blocked = Boolean(order.impossibleReason) || order.status === 'blocked';
  return <button className={`order-card ${selected ? 'is-selected' : ''} ${blocked ? 'is-blocked' : ''}`} onClick={() => selectOrder(order.id)} type="button">
    <div className="order-card__head"><span className="order-card__code">{order.code}</span><StatusPill tone={urgencyTone[order.urgency]}>{t(order.urgency)}</StatusPill></div>
    <strong className="order-card__title">{t(order.title)}</strong>
    <div className="order-card__metrics"><span><Icon name="box" size={14}/>{order.weightKg} {t('kg')}</span><span>+{order.rewardCredits} {t('CR')}</span>{order.deadlineMinute !== null ? <span><Icon name="clock" size={14}/>{Math.max(0, Math.round(order.deadlineMinute))} {t('min')}</span> : null}</div>
    <div className="order-card__foot"><span>{destination}</span><span className={blocked ? 'text-red' : order.status === 'delivered' ? 'text-mint' : ''}>{blocked ? t('Impossible') : t(order.status)}</span></div>
    {blocked ? <div className="order-card__blocker"><Icon name="alert" size={13}/>{t(order.impossibleReason ?? '')}</div> : null}
  </button>;
}
