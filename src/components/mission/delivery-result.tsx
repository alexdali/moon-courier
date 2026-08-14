'use client';

import { Icon } from '@/components/common/icon';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function DeliveryResult() {
  const { t } = useI18n();
  const replay = useMissionStore((state) => state.deliveryReplay);
  const setReplay = useMissionStore((state) => state.setDeliveryReplay);
  if (!replay) return null;
  const success = replay.delivery.status === 'succeeded';
  return <aside className={`delivery-result delivery-result--${success ? 'success' : 'failure'}`}>
    <button className="delivery-result__close" onClick={() => setReplay(null)} type="button" aria-label={t('Close')}>×</button>
    <span className="delivery-result__icon"><Icon name={success ? 'check' : 'alert'} size={26}/></span>
    <div><small>{t(success ? 'DELIVERY COMPLETE' : 'DELIVERY FAILED')}</small><h3>{replay.order.code} · {replay.order.title}</h3><p>{success ? `${replay.rover.code} ${t('reached the destination.')}` : `${t('Failure')}: ${t(replay.delivery.failureCode ?? 'unknown incident')}.`}</p></div>
    <div className="delivery-result__metrics"><span><small>{t('Net result')}</small><strong>{(replay.delivery.actualNetCredits ?? 0) > 0 ? '+' : ''}{replay.delivery.actualNetCredits?.toFixed(0)} CR</strong></span><span><small>{t('Battery')}</small><strong>{replay.rover.batteryPercent.toFixed(0)}%</strong></span><span><small>{t('Events')}</small><strong>{replay.events.length}</strong></span></div>
  </aside>;
}
