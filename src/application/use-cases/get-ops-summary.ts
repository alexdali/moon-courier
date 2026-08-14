import type { OpsSummaryDto } from '@/application/dto/ops-summary';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { MetricsQueryRepository } from '@/infrastructure/db/metrics-query-repository';
import { getEnv } from '@/config/env';
import { getFeatureFlags } from '@/config/feature-flags';

export class GetOpsSummaryUseCase {
  constructor(private readonly repositories: RepositoryBundle, private readonly metrics: MetricsQueryRepository) {}
  execute(): OpsSummaryDto {
    const env = getEnv();
    const flags = getFeatureFlags();
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);
    return {
      database: this.metrics.counts(),
      ai: {
        enabled: flags.aiEnabled,
        primaryModel: env.AI_PRIMARY_MODEL,
        fallbackModel: env.AI_FALLBACK_MODEL,
        costTodayUsd: this.repositories.aiAudit.sumCostSince(midnight.toISOString()),
        recentRuns: this.repositories.aiAudit.listRecent(12),
      },
      runtime: {
        node: process.version,
        environment: env.NODE_ENV,
        databasePath: env.DATABASE_PATH,
      },
    };
  }
}
