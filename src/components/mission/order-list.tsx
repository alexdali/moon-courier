'use client';

import { useMemo, useState } from 'react';
import { OrderCard } from '@/components/mission/order-card';
import { useI18n } from '@/i18n/i18n-provider';
import { useMissionStore } from '@/stores/mission-store-provider';

export function OrderList() {
  const { t } = useI18n();
  const orders = useMissionStore((state) => state.dashboard.orders);
  const nodes = useMissionStore((state) => state.dashboard.world.nodes);
  const [filter, setFilter] = useState<'all' | 'critical' | 'feasible' | 'blocked'>('all');
  const visible = useMemo(() => orders.filter((order) => {
    if (filter === 'critical') return order.urgency === 'critical';
    if (filter === 'feasible') return order.status === 'pending' && !order.impossibleReason;
    if (filter === 'blocked') return Boolean(order.impossibleReason) || order.status === 'blocked';
    return true;
  }), [filter, orders]);
  return <section className="mission-panel order-panel">
    <header className="panel-header"><div><span className="panel-kicker">{t('Queue')}</span><h2>{t('Orders')} <small>{orders.filter((order) => order.status === 'pending').length} {t('active')}</small></h2></div></header>
    <div className="segmented segmented--compact">
      {(['all', 'critical', 'feasible', 'blocked'] as const).map((value) => <button key={value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} type="button">{t(value)}</button>)}
    </div>
    <div className="order-list">{visible.map((order) => <OrderCard key={order.id} order={order} destination={nodes.find((node) => node.id === order.destinationNodeId)?.name ?? order.destinationNodeId}/>)}</div>
  </section>;
}
