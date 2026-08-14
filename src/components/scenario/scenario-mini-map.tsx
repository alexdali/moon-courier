'use client';

import type { WorldMap } from '@/domain/entities/world';
import { useI18n } from '@/i18n/i18n-provider';

export function ScenarioMiniMap({ world }: { world: WorldMap }) {
  const { t } = useI18n();
  const nodeById = new Map(world.nodes.map((node) => [node.id, node]));
  return <svg className="scenario-mini-map" viewBox="0 0 100 100" role="img" aria-label={t('Generated scenario map')}>
    <rect width="100" height="100" rx="5" fill="#0a151d"/>
    <g opacity=".35" stroke="#29404f" strokeWidth=".25">{Array.from({ length: 10 }, (_, i) => <g key={i}><line x1={i * 10} y1="0" x2={i * 10} y2="100"/><line x1="0" y1={i * 10} x2="100" y2={i * 10}/></g>)}</g>
    {world.zones.map((zone) => <polygon key={zone.id} points={zone.polygon.map((point) => `${point.x},${point.y}`).join(' ')} fill={zone.color} fillOpacity=".11" stroke={zone.color} strokeOpacity=".35" strokeDasharray="1 1"/>) }
    {world.edges.map((edge) => { const a = nodeById.get(edge.fromNodeId); const b = nodeById.get(edge.toNodeId); return a && b ? <line key={edge.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={edge.baseRisk > .15 ? '#ff5c73' : '#385364'} strokeWidth=".65"/> : null; })}
    {world.nodes.map((node) => <g key={node.id} transform={`translate(${node.x} ${node.y})`}><circle r={node.kind === 'base' ? 3 : 2} fill={node.kind === 'base' ? '#42d9ff' : '#c8d3da'}/><circle r={node.kind === 'base' ? 5 : 3.4} fill="none" stroke={node.kind === 'base' ? '#42d9ff' : '#71828d'} opacity=".45"/><text y="-4" textAnchor="middle" fill="#cdd9df" fontSize="3.1">{node.code}</text></g>)}
  </svg>;
}
