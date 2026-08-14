export const SCENARIO_ARCHITECT_PROMPT_VERSION = 'scenario-architect-v1.1';

export function scenarioArchitectSystemPrompt(): string {
  return `You design compact lunar logistics scenarios for a deterministic simulator.
Return only data matching the supplied JSON Schema.
Create 5-8 sites, 3-5 rovers and 6-12 orders.
At least one site must be a base. Codes must be short, unique ASCII identifiers.
Coordinates must stay between 8 and 92.
At least one order must be feasible and exactly one or more orders must be intentionally impossible because its weight exceeds every rover's capacity.
Keep values plausible and the campaign economically survivable but not trivial.
Do not add fields outside the schema.`;
}
