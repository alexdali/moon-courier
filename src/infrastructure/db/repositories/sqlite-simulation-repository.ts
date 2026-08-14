import type { SimulationRepository } from '@/application/ports/simulation-repository';
import type { SimulationRun, SimulationSample } from '@/domain/entities/simulation';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { boolToInt } from '@/infrastructure/db/sqlite-helpers';
import { mapSimulationRun } from '@/infrastructure/db/row-mappers';

export class SqliteSimulationRepository implements SimulationRepository {
  constructor(private readonly db: SqliteDatabase) {}
  save(run: SimulationRun, samples: readonly SimulationSample[] = []): void {
    const insertRun = this.db.prepare(`INSERT INTO simulation_runs
      (id, mission_id, scenario_id, kind, policy_json, seed, iterations, status, input_json, summary_json, started_at, completed_at, error)
      VALUES (@id, @missionId, @scenarioId, @kind, @policyJson, @seed, @iterations, @status, @inputJson, @summaryJson, @startedAt, @completedAt, @error)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, summary_json=excluded.summary_json,
        completed_at=excluded.completed_at, error=excluded.error`);
    const insertSample = this.db.prepare(`INSERT OR REPLACE INTO simulation_samples
      (id, run_id, sample_index, seed, final_credits, delivered_orders, failed_deliveries, expired_orders, success)
      VALUES (@id, @runId, @sampleIndex, @seed, @finalCredits, @deliveredOrders, @failedDeliveries, @expiredOrders, @success)`);
    this.db.transaction(() => {
      insertRun.run({
        ...run,
        policyJson: JSON.stringify(run.policy),
        inputJson: JSON.stringify({ policy: run.policy, iterations: run.iterations }),
        summaryJson: run.summary ? JSON.stringify(run.summary) : null,
      });
      samples.forEach((sample, index) => insertSample.run({
        id: `${run.id}_sample_${index + 1}`, runId: run.id, sampleIndex: index + 1, ...sample, success: boolToInt(sample.success),
      }));
    })();
  }
  listRecent(limit: number): readonly SimulationRun[] {
    return (this.db.prepare('SELECT * FROM simulation_runs ORDER BY started_at DESC LIMIT ?').all(limit) as Record<string, unknown>[]).map(mapSimulationRun);
  }
}
