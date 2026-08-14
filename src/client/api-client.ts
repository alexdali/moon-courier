import type { AiAssistantResponseDto } from '@/application/dto/ai-assistant';
import type { AnalyticsDashboardDto } from '@/application/dto/analytics-dashboard';
import type { DeliveryReplayDto } from '@/application/dto/delivery-replay';
import type { DispatchPreviewDto } from '@/application/dto/dispatch-preview';
import type { MissionDashboardDto } from '@/application/dto/mission-dashboard';
import type { OpsSummaryDto } from '@/application/dto/ops-summary';
import type { RoverChargeDto } from '@/application/dto/rover-charge';
import type { RoverRepairDto } from '@/application/dto/rover-repair';
import type { ScenarioGenerationDto } from '@/application/dto/scenario-generation';

export class ApiClientError extends Error {
  constructor(message: string, readonly status: number, readonly payload: unknown) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
  if (!response.ok) throw new ApiClientError(payload.message ?? `Request failed: ${response.status}`, response.status, payload);
  return payload as T;
}

export const apiClient = {
  mission: () => request<MissionDashboardDto>('/api/mission'),
  resetMission: () => request<MissionDashboardDto>('/api/mission/reset', { method: 'POST' }),
  previewDispatch: (body: { missionId: string; orderId: string; roverId: string; objective: string }) =>
    request<DispatchPreviewDto>('/api/dispatch/preview', { method: 'POST', body: JSON.stringify(body) }),
  launchDelivery: (body: { missionId: string; orderId: string; roverId: string; objective: string; idempotencyKey: string }) =>
    request<DeliveryReplayDto>('/api/dispatch/launch', { method: 'POST', body: JSON.stringify(body) }),
  chargeRover: (roverId: string, body: { missionId: string; targetBatteryPercent?: number }) =>
    request<RoverChargeDto>(`/api/rovers/${encodeURIComponent(roverId)}/charge`, { method: 'POST', body: JSON.stringify(body) }),
  repairRover: (roverId: string, body: { missionId: string }) =>
    request<RoverRepairDto>(`/api/rovers/${encodeURIComponent(roverId)}/repair`, { method: 'POST', body: JSON.stringify(body) }),
  askAi: (body: { missionId: string; message: string; selectedOrderId?: string; selectedRoverId?: string }) =>
    request<AiAssistantResponseDto>('/api/ai/assistant', { method: 'POST', body: JSON.stringify(body) }),
  scenarios: () => request<readonly Record<string, unknown>[]>('/api/scenarios'),
  generateScenario: (body: { prompt: string; seed?: number; difficulty?: string; durationDays?: number }) =>
    request<ScenarioGenerationDto>('/api/scenarios/generate', { method: 'POST', body: JSON.stringify(body) }),
  activateScenario: (id: string) => request<MissionDashboardDto>(`/api/scenarios/${encodeURIComponent(id)}/activate`, { method: 'POST' }),
  analytics: (iterations = 80) => request<AnalyticsDashboardDto>(`/api/analytics?iterations=${iterations}`),
  runSimulation: (iterations = 200) => request<unknown>('/api/analytics/simulate', { method: 'POST', body: JSON.stringify({ iterations }) }),
  ops: () => request<OpsSummaryDto>('/api/ops/summary'),
};
