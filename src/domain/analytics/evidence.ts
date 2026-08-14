import type { AnalyticsEvidence } from '@/domain/entities/analytics';

export function createAnalyticsEvidence(input: {
  eventCount: number;
  deliveryCount: number;
  simulationIterations: number;
  generatedAt: string;
}): AnalyticsEvidence {
  return {
    eventCount: Math.max(0, input.eventCount),
    deliveryCount: Math.max(0, input.deliveryCount),
    simulationIterations: Math.max(0, input.simulationIterations),
    generatedAt: input.generatedAt,
  };
}
