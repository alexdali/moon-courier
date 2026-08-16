'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/common/icon';
import { useMissionView } from '@/components/mission/mission-view-provider';
import { useMissionStore } from '@/stores/mission-store-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function LunarMap() {
  const { t } = useI18n();
  const { mode, theme } = useMissionView();
  const [showDetails, setShowDetails] = useState(false);
  const world = useMissionStore((state) => state.dashboard.world);
  const orders = useMissionStore((state) => state.dashboard.orders);
  const rovers = useMissionStore((state) => state.dashboard.rovers);
  const selectedOrderId = useMissionStore((state) => state.selectedOrderId);
  const selectedRoverId = useMissionStore((state) => state.selectedRoverId);
  const preview = useMissionStore((state) => state.preview);
  const replay = useMissionStore((state) => state.deliveryReplay);
  const missionSeed = useMissionStore((state) => state.dashboard.mission.seed);
  const nodes = useMemo(() => new Map(world.nodes.map((node) => [node.id, node])), [world.nodes]);
  const routeEdges = new Set(preview?.route?.segments.map((segment) => segment.edgeId) ?? []);
  const simplified = mode === 'simple' && !showDetails;
  return <section className={`map-shell ${mode === 'simple' ? 'map-shell--simple' : ''} ${simplified ? 'is-simplified' : ''}`}>
    <div className="map-toolbar"><span>{t(mode === 'simple' ? 'MISSION MAP' : 'TACTICAL MAP')}</span><span className="map-toolbar__right">{!simplified ? <span className="map-legend"><i className="legend-dot legend-dot--cyan"/>{t('selected route')} <i className="legend-dot legend-dot--red"/>{t('high risk')}</span> : null}{mode === 'simple' ? <button className="map-detail-toggle" type="button" onClick={() => setShowDetails((value) => !value)} aria-pressed={showDetails}><Icon name="settings" size={14}/>{t(showDetails ? 'Hide map details' : 'Show map details')}</button> : null}</span></div>
    <svg className="lunar-map" viewBox="0 0 100 100" role="img" aria-label={t('Lunar delivery map')}>
      <defs>
        <radialGradient id="moonSurface"><stop offset="0" stopColor={theme === 'light' ? '#ffffff' : '#172631'}/><stop offset="1" stopColor={theme === 'light' ? '#e8f5f8' : '#09131b'}/></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="1.25" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#29404f" strokeWidth=".18" opacity=".55"/></pattern>
      </defs>
      <rect width="100" height="100" fill="url(#moonSurface)"/>{simplified ? null : <rect width="100" height="100" fill="url(#grid)"/>}
      {simplified ? null : <g opacity=".24" fill="none" stroke="#6f7c83" strokeWidth=".35"><circle cx="18" cy="18" r="8"/><circle cx="18" cy="18" r="4.4"/><circle cx="72" cy="73" r="12"/><circle cx="72" cy="73" r="7"/><circle cx="48" cy="26" r="5"/><path d="M5 82c18-8 31-1 44-7s25-14 46-8"/></g>}
      {simplified ? null : <g>{world.zones.map((zone) => <polygon key={zone.id} points={zone.polygon.map((point) => `${point.x},${point.y}`).join(' ')} fill={zone.color} fillOpacity={Math.min(.18, .055 * zone.riskMultiplier)} stroke={zone.color} strokeOpacity=".32" strokeWidth=".35" strokeDasharray="1.4 1.4"/>)}</g>}
      <g>{world.edges.map((edge) => {
        const from = nodes.get(edge.fromNodeId); const to = nodes.get(edge.toNodeId); if (!from || !to) return null;
        const active = routeEdges.has(edge.id);
        return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={active ? 'map-edge map-edge--active' : !simplified && edge.baseRisk > .15 ? 'map-edge map-edge--risk' : 'map-edge'}/>;
      })}</g>
      {preview?.route ? <polyline className="map-route-pulse" points={preview.route.nodeIds.map((id) => nodes.get(id)).filter(Boolean).map((node) => `${node!.x},${node!.y}`).join(' ')} fill="none"/> : null}
      <g>{world.nodes.map((node) => <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`map-node map-node--${node.kind}`}><circle r={node.kind === 'base' ? 2.5 : 1.65}/><circle r={node.kind === 'base' ? 4.2 : 2.9} className="map-node__halo"/><text y={rovers.some((rover) => rover.nodeId === node.id) ? -12 : -4.4} textAnchor="middle">{node.code}</text></g>)}</g>
      <g>{orders.filter((order) => ['pending', 'assigned', 'in_transit'].includes(order.status)).map((order) => {
        const node = nodes.get(order.destinationNodeId); if (!node) return null; const selected = order.id === selectedOrderId;
        const nodeOrders = orders.filter((item) => item.destinationNodeId === order.destinationNodeId && ['pending', 'assigned', 'in_transit'].includes(item.status));
        const markerIndex = nodeOrders.findIndex((item) => item.id === order.id);
        const offsetX = (markerIndex - (nodeOrders.length - 1) / 2) * 5.2;
        const offsetY = markerIndex % 2 === 0 ? 2.8 : 5.4;
        const labelOnLeft = nodeOrders.length > 1 && markerIndex < nodeOrders.length / 2;
        return <g key={order.id} transform={`translate(${node.x + 2.8 + offsetX} ${node.y + offsetY})`} className={`order-marker ${selected ? 'is-selected' : ''} ${order.impossibleReason ? 'is-blocked' : ''}`}><rect x="-1.7" y="-1.7" width="3.4" height="3.4" transform="rotate(45)"/>{simplified && !selected ? null : <text x={labelOnLeft ? -3.5 : 3.5} y="1" textAnchor={labelOnLeft ? 'end' : 'start'}>{order.code}</text>}</g>;
      })}</g>
      <g>{rovers.map((rover) => {
        const node = nodes.get(rover.nodeId); if (!node) return null; const selected = rover.id === selectedRoverId;
        const moving = replay?.rover.id === rover.id;
        const nodeRovers = rovers.filter((item) => item.nodeId === rover.nodeId);
        const markerIndex = nodeRovers.findIndex((item) => item.id === rover.id);
        const angle = -Math.PI / 2 + (markerIndex * Math.PI * 2) / nodeRovers.length;
        const radius = nodeRovers.length > 1 ? 7.4 : 0;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        return <g key={rover.id} transform={`translate(${node.x + offsetX} ${node.y + offsetY})`} className={`rover-marker ${selected ? 'is-selected' : ''} ${moving ? 'is-moving' : ''}`} filter={selected ? 'url(#glow)' : undefined}><circle r="2.1"/><path d="M-1.5 0h3M-1 1.3h2M0-1.5v3"/><text y="5" textAnchor="middle">{rover.code}</text></g>;
      })}</g>
    </svg>
    {simplified ? null : <div className="map-footer"><span>{world.nodes.length} {t('sites')} · {world.edges.length} {t('routes')}</span><span>{t('Seed')} {missionSeed}</span></div>}
  </section>;
}
