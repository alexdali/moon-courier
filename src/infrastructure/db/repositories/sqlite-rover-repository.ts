import type { RoverRepository } from '@/application/ports/rover-repository';
import type { MissionId, RoverId } from '@/domain/common/ids';
import type { Rover } from '@/domain/entities/rover';
import type { SqliteDatabase } from '@/infrastructure/db/client';
import { mapRover } from '@/infrastructure/db/row-mappers';

export class SqliteRoverRepository implements RoverRepository {
  constructor(private readonly db: SqliteDatabase) {}
  listByMission(missionId: MissionId): readonly Rover[] {
    return (this.db.prepare('SELECT * FROM rovers WHERE mission_id = ? ORDER BY code').all(missionId) as Record<string, unknown>[]).map(mapRover);
  }
  getById(id: RoverId): Rover | null {
    const row = this.db.prepare('SELECT * FROM rovers WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? mapRover(row) : null;
  }
  insertMany(rovers: readonly Rover[]): void {
    const statement = this.db.prepare(`INSERT INTO rovers
      (id, mission_id, code, name, status, node_id, battery_percent, battery_capacity_kwh, capacity_kg,
       base_speed_kph, base_energy_kwh_per_km, risk_resistance, repair_cost_credits, metadata_json)
      VALUES (@id, @missionId, @code, @name, @status, @nodeId, @batteryPercent, @batteryCapacityKwh, @capacityKg,
       @baseSpeedKph, @baseEnergyKwhPerKm, @riskResistance, @repairCostCredits, @metadataJson)`);
    this.db.transaction(() => rovers.forEach((rover) => statement.run({ ...rover, metadataJson: JSON.stringify(rover.metadata) })))();
  }
  update(rover: Rover): void {
    this.db.prepare(`UPDATE rovers SET status=@status, node_id=@nodeId, battery_percent=@batteryPercent,
      metadata_json=@metadataJson WHERE id=@id`).run({ ...rover, metadataJson: JSON.stringify(rover.metadata) });
  }
  deleteByMission(missionId: MissionId): void { this.db.prepare('DELETE FROM rovers WHERE mission_id = ?').run(missionId); }
}
