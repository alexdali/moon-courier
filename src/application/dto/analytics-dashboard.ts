import type {
  AnalyticsEvidence,
  EconomyPoint,
  FailureBreakdownItem,
  MissionKpis,
  RoverUtilizationItem,
} from '@/domain/entities/analytics';
import type { SimulationSummary } from '@/domain/entities/simulation';

export interface AnalyticsDashboardDto {
  kpis: MissionKpis;
  economy: readonly EconomyPoint[];
  failures: readonly FailureBreakdownItem[];
  roverUtilization: readonly RoverUtilizationItem[];
  comparison: readonly {
    key: string;
    label: string;
    summary: SimulationSummary;
  }[];
  evidence: AnalyticsEvidence;
}
