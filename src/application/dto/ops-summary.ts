export interface OpsSummaryDto {
  database: {
    scenarios: number;
    missions: number;
    rovers: number;
    orders: number;
    deliveries: number;
    events: number;
    aiRuns: number;
  };
  ai: {
    enabled: boolean;
    primaryModel: string;
    fallbackModel: string;
    costTodayUsd: number;
    recentRuns: readonly Record<string, unknown>[];
  };
  runtime: {
    node: string;
    environment: string;
    databasePath: string;
  };
}
