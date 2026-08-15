'use client';

import type { Rover } from '@/domain/entities/rover';
import { Icon } from '@/components/common/icon';
import { ProgressBar } from '@/components/common/progress-bar';
import { StatusPill } from '@/components/common/status-pill';
import { useMissionActions } from '@/hooks/use-mission-actions';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

const statusTone = { available: 'mint', assigned: 'cyan', en_route: 'cyan', charging: 'violet', damaged: 'red', disabled: 'red' } as const;

export function RoverCard({ rover }: { rover: Rover }) {
  const { t } = useI18n();
  const selected = useMissionStore((state) => state.selectedRoverId === rover.id);
  const selectRover = useMissionStore((state) => state.selectRover);
  const busy = useMissionStore((state) => state.busy);
  const selectedOrder = useMissionStore((state) => state.dashboard.orders.find((order) => order.id === state.selectedOrderId));
  const { charge, repair } = useMissionActions();
  const capacityDeficit = selectedOrder ? Math.max(0, selectedOrder.weightKg - rover.capacityKg) : 0;
  const tone = rover.batteryPercent < 20 ? 'red' : rover.batteryPercent < 35 ? 'amber' : 'mint';
  const chargeAllowed = rover.status === 'available' && rover.batteryPercent < 99.5;
  const repairAllowed = rover.status === 'damaged';
  return <article className={`rover-card ${selected ? 'is-selected' : ''} ${capacityDeficit > 0 ? 'is-incompatible' : ''}`}>
    <button type="button" className="rover-card__select" onClick={() => selectRover(rover.id)}>
      <span className="rover-card__head"><span className="rover-card__identity"><span className="rover-card__icon"><Icon name="rover" size={18}/></span><span><strong>{rover.code}</strong><small>{rover.name}</small></span></span><StatusPill tone={statusTone[rover.status]}>{t(rover.status)}</StatusPill></span>
      <ProgressBar value={rover.batteryPercent} tone={tone} label={`${rover.batteryPercent.toFixed(0)}% ${t('battery')}`}/>
      <span className="rover-card__metrics"><span>{rover.capacityKg} {t('kg')} {t('capacity')}</span><span>{rover.baseSpeedKph} {t('km/h')}</span></span>
      {capacityDeficit > 0 ? <span className="rover-card__warning"><Icon name="alert" size={13}/>{t('Capacity deficit')} {capacityDeficit} {t('kg')}</span> : null}
    </button>
    {repairAllowed ? <button type="button" className="rover-card__charge rover-card__charge--repair" disabled={busy !== null} onClick={() => void repair(rover.id)}>
      <Icon name="tool" size={13}/>{t('Repair rover')}
    </button> : <button type="button" className="rover-card__charge" disabled={!chargeAllowed || busy !== null} onClick={() => void charge(rover.id)}>
      <Icon name="battery" size={13}/>{t('Charge to 100%')}
    </button>}
  </article>;
}
