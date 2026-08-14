# Moon Courier Crisis — demo evidence

Generated: 2026-08-14T23:05:31.814Z

## Acceptance evidence

- Scenario validation: **PASS**
- Feasible rover/order assignments: **6**
- Intentionally impossible orders: **HAB-021**
- Seeded balance simulation: **65% success rate** over 500 runs
- Database foreign-key violations: **0**

## AI routing

- Primary: `deepseek/deepseek-v4-flash-0731`
- Fallback: `openai/gpt-5.6-luna`
- API configured in this run: **false**
- Local model: **not implemented**; architecture note only.

## Database counts

```json
{
  "scenarios": 1,
  "missions": 1,
  "rovers": 3,
  "orders": 6,
  "deliveries": 0,
  "events": 0,
  "aiRuns": 0
}
```

## Validation checks

- PASS: **UNIQUE_IDENTIFIERS** — All identifiers are unique
- PASS: **MAP_CONNECTED** — Map graph is connected
- PASS: **REFERENCES_VALID** — All map references resolve
- PASS: **HAS_FEASIBLE_DELIVERY** — 6 feasible assignments found
- PASS: **HAS_IMPOSSIBLE_ORDER** — Impossible order(s): HAB-021
- PASS: **NUMERIC_RANGES** — Numeric values are within accepted ranges
- PASS: **RULE_RANGES** — Scenario rules are within accepted ranges
- PASS: **TARGET_GROSS_UPPER_BOUND** — Target is below gross upper bound of 4080 credits
