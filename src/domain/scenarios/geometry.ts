import { roundTo } from '@/domain/common/math';

export function euclideanDistance(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return Math.sqrt((left.x - right.x) ** 2 + (left.y - right.y) ** 2);
}

export function mapDistanceKm(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return roundTo(Math.max(1.5, euclideanDistance(left, right) * 0.24), 2);
}
