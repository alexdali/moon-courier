import type { ScenarioRepository } from '@/application/ports/scenario-repository';
import type { ScenarioId } from '@/domain/common/ids';
import type { ScenarioDefinition, ScenarioRules } from '@/domain/entities/scenario';
import type { OrderTemplate } from '@/domain/entities/order';
import type { RoverTemplate } from '@/domain/entities/rover';
import type { ScenarioValidationReport } from '@/domain/scenarios/scenario-validator';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { jsonColumn } from '@/infrastructure/db/sqlite-helpers';
import { SqliteWorldRepository } from '@/infrastructure/db/repositories/sqlite-world-repository';

export class SqliteScenarioRepository implements ScenarioRepository {
  private readonly worlds: SqliteWorldRepository;
  constructor(private readonly db: SqliteDatabase) { this.worlds = new SqliteWorldRepository(db); }

  getById(id: ScenarioId): ScenarioDefinition | null {
    const row = this.db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    const version = this.db.prepare('SELECT content_json FROM scenario_versions WHERE scenario_id = ? ORDER BY version DESC LIMIT 1').get(id) as { content_json: string } | undefined;
    const content = version ? jsonColumn<Partial<ScenarioDefinition>>(version.content_json, {}) : {};
    return {
      id: String(row.id),
      name: String(row.name),
      description: String(row.description),
      seed: Number(row.seed),
      difficulty: row.difficulty as ScenarioDefinition['difficulty'],
      source: row.source as ScenarioDefinition['source'],
      rules: jsonColumn<ScenarioRules>(row.rules_json, content.rules as ScenarioRules),
      world: this.worlds.getByScenarioId(id),
      roverTemplates: (content.roverTemplates ?? []) as readonly RoverTemplate[],
      orderTemplates: (content.orderTemplates ?? []) as readonly OrderTemplate[],
    };
  }

  list(): readonly ScenarioDefinition[] {
    const ids = this.db.prepare('SELECT id FROM scenarios ORDER BY updated_at DESC').all() as { id: string }[];
    return ids.map(({ id }) => this.getById(id)).filter((item): item is ScenarioDefinition => item !== null);
  }

  save(definition: ScenarioDefinition, options: { validation: ScenarioValidationReport; prompt?: string; model?: string }): void {
    const now = new Date().toISOString();
    const operation = this.db.transaction(() => {
      this.db.prepare(`INSERT INTO scenarios
        (id, name, description, seed, duration_days, difficulty, status, source, rules_json, created_at, updated_at)
        VALUES (@id, @name, @description, @seed, @durationDays, @difficulty, 'validated', @source, @rulesJson, @now, @now)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description, seed=excluded.seed,
          duration_days=excluded.duration_days, difficulty=excluded.difficulty, source=excluded.source,
          rules_json=excluded.rules_json, updated_at=excluded.updated_at`).run({
        id: definition.id, name: definition.name, description: definition.description, seed: definition.seed,
        durationDays: definition.rules.durationDays, difficulty: definition.difficulty, source: definition.source,
        rulesJson: JSON.stringify(definition.rules), now,
      });
      this.worlds.replaceForScenario(definition.id, definition.world);
      const latest = this.db.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM scenario_versions WHERE scenario_id = ?').get(definition.id) as { version: number };
      const version = Number(latest.version) + 1;
      this.db.prepare(`INSERT INTO scenario_versions
        (id, scenario_id, version, content_json, validation_json, prompt, model, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        `${definition.id}_v${version}`, definition.id, version, JSON.stringify(definition), JSON.stringify(options.validation),
        options.prompt ?? null, options.model ?? null, now,
      );
    });
    operation();
  }

  deleteAll(): void { this.db.prepare('DELETE FROM scenarios').run(); }
}
