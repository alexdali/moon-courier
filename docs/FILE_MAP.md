# Карта файлов

Стартовый репозиторий намеренно разбит на небольшие модули. Цель — не искусственно увеличить число файлов, а сделать границы ответственности видимыми и дать возможность развивать подсистемы независимо.

## Root

```text
README.md                 Главный запуск, архитектура и демонстрация
CONTRIBUTING.md             Правила изменения домена, AI и UI
SECURITY.md                 Короткая security entry point
Makefile                    Алиасы основных npm-команд
.editorconfig               Базовый формат файлов
.dockerignore               Контекст production image
.github/                    CI, E2E, Dependabot и templates
package.json              Команды и зависимости
.env.example              Полная runtime-конфигурация
next.config.ts            Next standalone + native SQLite package
vitest.config.ts          Unit/integration/property tests
playwright.config.ts      Desktop E2E profile
eslint.config.mjs         Lint
Dockerfile                Production image
docker-compose.yml        Web + persistent SQLite volume
migrations/               Ordered SQL schema
scripts/                  Operational CLI
public/mockups/            Исходные HTML-мокапы визуальной концепции
```

# 1. `src/config`

```text
ai-models.ts       Model role/config и pricing inputs
app-metadata.ts    Название, версия и product metadata
env.ts             Zod validation environment
feature-flags.ts   AI/degraded/local-model flags
```

# 2. `src/domain/common`

```text
errors.ts          Domain/Application-safe error classes
ids.ts             Semantic ID aliases
math.ts            clamp, round, mean utilities
result.ts          Result helpers
seeded-random.ts   Reproducible PRNG and seed composition
```

# 3. `src/domain/entities`

```text
analytics.ts       KPI/evidence/read-model types
delivery.ts        Route, segment and delivery contracts
economy.ts         Financial ledger entity
event.ts           Mission event taxonomy
mission.ts         Mission runtime state
order.ts           Order template/runtime state
rover.ts           Rover template/runtime state
scenario.ts        Scenario definition/rules
simulation.ts      Policies, samples, runs and summaries
world.ts           Zone/node/edge graph
```

# 4. `src/domain/rules`

```text
load.ts            Load ratio, utilization and capacity deficit
speed.ts           Effective speed and travel time
energy.ts          Energy and battery conversion
risk.ts            Segment/route risk formulas
route-metrics.ts   Aggregate route metrics
economy.ts         Expected delivery economics
feasibility.ts     Blocking/warning gate
charging.ts        Charging time/energy/cost plan
maintenance.ts     Repair plan
mission-goal.ts    Win/loss/progress evaluation
```

# 5. `src/domain/routing`

```text
graph.ts           Adjacency representation
dijkstra.ts        Generic weighted shortest path
route-planner.ts   Full empty + loaded route and objectives
```

# 6. `src/domain/planning`

```text
candidate.ts        Candidate aggregate
constraints.ts      Human/AI planning constraints
policies.ts         Simulation policy → constraints
score.ts            Candidate scoring
 dispatch-planner.ts Candidate matrix and recommendation
```

# 7. `src/domain/state`

```text
mission-state-machine.ts   Valid mission transitions
order-state-machine.ts     Valid order transitions
rover-state-machine.ts     Valid rover transitions
```

State machines являются отдельными модулями, чтобы позже можно было добавить async/concurrent delivery lifecycle без переписывания entities.

# 8. `src/domain/simulation`

```text
mission-factory.ts      Pure in-memory mission creation
event-factory.ts        Stable event construction
delivery-resolver.ts    Seeded delivery outcome
rover-charger.ts        Charge state/economy resolution
rover-repairer.ts       Repair state/economy resolution
mission-simulator.ts    Single sample + Monte Carlo
```

# 9. `src/domain/scenarios`

```text
blueprint.ts                AI/manual intermediate contract
geometry.ts                 Coordinate/polygon helpers
graph-validator.ts          Connectivity and references
deterministic-generator.ts  No-AI valid scenario fallback
scenario-compiler.ts        Blueprint → stable domain IDs
scenario-validator.ts       Domain acceptance gate
balance-analyzer.ts         Monte Carlo quality classification
```

# 10. `src/domain/analytics`

```text
counterfactual.ts       Scenario interventions
economy-timeline.ts     Ledger → chart points
evidence.ts             Evidence metadata
failure-breakdown.ts    Failure grouping
mission-kpis.ts         Core KPI calculation
percentiles.ts          P10/P50/P90
rover-utilization.ts    Fleet utilization
```

# 11. `src/application/ports`

```text
ai-service.ts               AI use-case abstraction
ai-audit-repository.ts      Model/tool audit contract
clock.ts                    Time abstraction
delivery-repository.ts      Delivery persistence
 economy-repository.ts      Ledger persistence
event-repository.ts         Timeline persistence
id-generator.ts             ID abstraction
mission-repository.ts       Mission persistence
order-repository.ts         Order persistence
repository-bundle.ts        Aggregate dependency
rover-repository.ts         Rover persistence
scenario-repository.ts      Scenario/version persistence
simulation-repository.ts    Simulation persistence
snapshot-repository.ts      Snapshot persistence
transaction-runner.ts       Transaction boundary
world-repository.ts         Graph persistence
```

# 12. `src/application/dto`

```text
ai-assistant.ts          Browser-safe Mission Control response
analytics-dashboard.ts  Analytics screen contract
delivery-replay.ts      Persisted delivery animation contract
dispatch-preview.ts     Preview contract
mission-dashboard.ts    Main screen contract
ops-summary.ts          Technical evidence contract
rover-charge.ts         Charge command result
rover-repair.ts         Repair command result
scenario-generation.ts  Scenario Architect result
```

# 13. `src/application/schemas`

```text
ai-requests.ts        HTTP input validation for AI
 dispatch-requests.ts HTTP input validation for preview/launch/service
```

# 14. `src/application/services`

```text
mission-state-factory.ts  Scenario → persistent mission instance
mission-state-reader.ts   Aggregate read from repositories
```

# 15. `src/application/use-cases`

```text
initialize-demo.ts             Bootstrap built-in scenario
reset-demo.ts                  Clean demo reset
get-mission-dashboard.ts       Main read model
preview-dispatch.ts            Non-mutating feasibility/economy preview
launch-delivery.ts             Atomic authoritative command
charge-rover.ts                Atomic charging command
repair-rover.ts                Atomic repair command
ask-mission-control.ts         AI query boundary
generate-scenario.ts           AI scenario boundary
list-scenarios.ts              Scenario query
activate-scenario.ts           Create mission from template
get-analytics-dashboard.ts     Deterministic analytics query
run-scenario-comparison.ts     Persisted simulation command
get-ops-summary.ts             Operational evidence query
```

# 16. `src/infrastructure/db`

```text
client.ts                    SQLite open/pragma/WAL
migrate.ts                   Ordered migration runner
row-mappers.ts               DB row → domain entities
sqlite-helpers.ts            JSON/count helpers
metrics-query-repository.ts  Ops-specific read query
```

## Repositories

```text
sqlite-repository-bundle.ts
sqlite-transaction-runner.ts
sqlite-scenario-repository.ts
sqlite-world-repository.ts
sqlite-mission-repository.ts
sqlite-rover-repository.ts
sqlite-order-repository.ts
sqlite-delivery-repository.ts
sqlite-event-repository.ts
sqlite-economy-repository.ts
sqlite-snapshot-repository.ts
sqlite-simulation-repository.ts
sqlite-ai-audit-repository.ts
```

# 17. Other infrastructure

```text
infrastructure/composition/app-container.ts  Composition root
infrastructure/logging/logger.ts             Structured logger
infrastructure/security/rate-limiter.ts      Demo in-memory limit
infrastructure/security/request-identity.ts  Request identity helper
infrastructure/system/system-clock.ts        Production clock
infrastructure/system/uuid-generator.ts      Production IDs
```

# 18. `src/modules/ai/openrouter`

```text
client.ts            Timeout-aware HTTP transport
errors.ts            Provider/output/attempt error taxonomy
request-builder.ts   Shared parameters and provider preferences
response-parser.ts   JSON/fenced JSON parser
types.ts             OpenRouter transport contracts
```

# 19. `src/modules/ai/routing` and audit

```text
routing/model-router.ts   Explicit DeepSeek → Luna attempts
audit/budget-guard.ts     Daily budget
audit/cost-calculator.ts  Token estimate fallback
```

# 20. AI agents, prompts, schemas and tools

```text
agents/mission-control-agent.ts
scenarios/scenario-generator.ts
offline/deterministic-assistant.ts
ai-service.ts

prompts/mission-control.ts
prompts/scenario-architect.ts
prompts/analytics-explainer.ts

schemas/assistant-answer-schema.ts
schemas/scenario-blueprint-schema.ts

tools/types.ts
tools/tool-registry.ts
tools/recommend-dispatch-tool.ts
tools/explain-dispatch-blockers-tool.ts
tools/get-mission-summary-tool.ts
tools/get-delivery-analytics-tool.ts
tools/compare-fleet-options-tool.ts
```

# 21. `src/app`

## Pages

```text
page.tsx             Mission Control
scenario/page.tsx    Scenario Architect
analytics/page.tsx   Mission Debrief
ops/page.tsx         Audit/ops
about/page.tsx       Approach and AI boundaries
layout.tsx           Root layout
error.tsx            UI error boundary
loading.tsx          Loading state
not-found.tsx        404
```

## API routes

```text
api/health/route.ts
api/mission/route.ts
api/mission/reset/route.ts
api/dispatch/preview/route.ts
api/dispatch/launch/route.ts
api/rovers/[id]/charge/route.ts
api/rovers/[id]/repair/route.ts
api/ai/assistant/route.ts
api/scenarios/route.ts
api/scenarios/generate/route.ts
api/scenarios/[id]/activate/route.ts
api/analytics/route.ts
api/analytics/simulate/route.ts
api/ops/summary/route.ts
```

Shared:

```text
api/_shared/body.ts
api/_shared/rate-limit.ts
api/_shared/responses.ts
```

# 22. Components

## Common/layout

```text
common/icon.tsx
common/metric.tsx
common/progress-bar.tsx
common/status-pill.tsx
layout/site-header.tsx
layout/page-heading.tsx
```

## Mission

```text
mission-control.tsx
mission-toolbar.tsx
order-list.tsx
order-card.tsx
rover-list.tsx
rover-card.tsx
lunar-map.tsx
dispatch-preview-panel.tsx
event-timeline.tsx
ai-console.tsx
delivery-result.tsx
```

## Scenario

```text
scenario-architect.tsx
scenario-mini-map.tsx
validation-list.tsx
```

## Analytics/Ops

```text
analytics-dashboard.tsx
economy-chart.tsx
failure-chart.tsx
utilization-chart.tsx
scenario-comparison.tsx
ops-dashboard.tsx
```

# 23. Client state

```text
client/api-client.ts
hooks/use-dispatch-preview.ts
hooks/use-mission-actions.ts
stores/mission-store.ts
stores/mission-store-provider.tsx
```

# 24. Fixtures

```text
demo-scenario.ts       Built-in scenario factory
scenario-prompts.ts    Scenario Architect presets
assistant-prompts.ts   Demo Mission Control prompts
evaluation-cases.ts    Live AI benchmark cases
```

# 25. Tests

## Helpers

```text
helpers/fake-clock.ts
helpers/fake-id-generator.ts
helpers/fixture-state.ts
helpers/test-context.ts
```

## Unit

```text
unit/domain/*.test.ts
unit/ai/*.test.ts
```

## Property

```text
property/physics-properties.test.ts
property/seeded-simulation-properties.test.ts
property/impossible-order-properties.test.ts
```

## Integration

```text
integration/bootstrap-persistence.test.ts
integration/dispatch-lifecycle.test.ts
integration/charging-repair.test.ts
integration/analytics.test.ts
integration/scenario-versioning.test.ts
integration/transaction-rollback.test.ts
integration/ai-audit.test.ts
```

## E2E

```text
e2e/api-health.spec.ts
e2e/mission-control.spec.ts
e2e/scenario-analytics.spec.ts
```

# 26. Scripts

```text
db-migrate.ts                 Apply migrations
db-seed.ts                    Initialize demo
db-inspect.ts                 Counts and core state
db-reset.ts                   Delete database safely
reset-demo-mission.ts         Reset runtime state
run-simulation.ts             Monte Carlo report
verify-models.ts              OpenRouter model availability
evaluate-ai.ts                Live DeepSeek/Luna evaluation
generate-evidence-report.ts   Markdown audit report
export-demo-data.ts           Portable JSON export
capture-screenshots.ts        Screenshot automation
validate-sql.ts               Clean SQLite migration test
validate-domain.ts            Demo scenario/invariant validation
clean.mjs                     Remove generated artifacts
smoke.mjs                     HTTP smoke
check-syntax.mjs              TS/TSX parser validation
check-structure.mjs           Required-file/import validation
check-doc-links.mjs           Local Markdown link validation
check-static-assets.mjs       Mockup references + JS syntax
check-secrets.mjs             Credential-pattern guard
lib/cli.ts                    CLI parsing
lib/files.ts                  File helpers
lib/project-paths.ts          Stable project paths
```

# 27. Documentation and ADR

См. [`docs/README.md`](README.md). ADR фиксируют ключевые решения, чтобы проверяющий видел не только итог, но и причины компромиссов.
