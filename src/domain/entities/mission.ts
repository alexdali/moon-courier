import type { MissionId, ScenarioId } from '@/domain/common/ids';

export type MissionStatus = 'ready' | 'active' | 'completed' | 'failed' | 'paused';

export interface Mission {
  id: MissionId;
  scenarioId: ScenarioId;
  name: string;
  status: MissionStatus;
  currentMinute: number;
  currentDay: number;
  credits: number;
  score: number;
  rating: number;
  targetCredits: number;
  seed: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
