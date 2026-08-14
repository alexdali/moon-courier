import { describe, expect, it } from 'vitest';
import { createDeterministicScenarioBlueprint } from '@/domain/scenarios/deterministic-generator';
import { scenarioBlueprintSchema } from '@/modules/ai/schemas/scenario-blueprint-schema';

describe('scenario structured output schema', () => {
  it('accepts the deterministic blueprint', () => {
    expect(scenarioBlueprintSchema.safeParse(createDeterministicScenarioBlueprint()).success).toBe(true);
  });
  it('rejects unknown destinations', () => {
    const blueprint = createDeterministicScenarioBlueprint();
    const invalid = { ...blueprint, orders: [{ ...blueprint.orders[0]!, destinationSiteCode: 'UNKNOWN' }, ...blueprint.orders.slice(1)] };
    expect(scenarioBlueprintSchema.safeParse(invalid).success).toBe(false);
  });
});
