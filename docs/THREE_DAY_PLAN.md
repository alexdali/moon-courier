# Почасовой план на 3 дня

План рассчитан на одного разработчика, 10–12 продуктивных часов в день. В каждом дне есть жёсткий gate: если gate не пройден, optional-функции не начинаются.

# День 1 — работающая игра без AI

## 09:00–10:00 — bootstrap

- создать Next.js/TypeScript проект;
- configs, env, lint, aliases;
- перенести design tokens и структуру экранов;
- создать docs skeleton.

## 10:00–11:30 — schema

- migrations;
- SQLite client;
- repositories contracts;
- demo data;
- seed/migrate scripts.

## 11:30–13:00 — domain entities/rules

- mission/order/rover/world/delivery;
- load/speed/energy/risk/economy;
- unit tests formulas.

## 14:00–16:00 — routing/feasibility

- graph;
- Dijkstra;
- full empty+loaded route;
- objectives;
- feasibility;
- mandatory impossible order test.

## 16:00–18:00 — command lifecycle

- preview use case/API;
- resolver;
- launch transaction;
- idempotency;
- events/economy/snapshot;
- integration test.

## 18:00–20:00 — main UI

- mission layout;
- order/rover cards;
- SVG map;
- preview panel;
- result panel;
- event timeline;
- API client/store/hooks.

## 20:00–21:00 — service operations

- charge;
- repair;
- UI buttons;
- tests.

### Gate дня 1

```text
fresh DB → main screen → impossible pair blocked → feasible pair launched → state persisted
```

# День 2 — AI Mission Control и сценарии

## 09:00–10:00 — OpenRouter transport

- request/response types;
- timeout/error handling;
- headers/provider preferences;
- usage/cost parsing.

## 10:00–11:30 — model routing

- model configs;
- DeepSeek primary;
- Luna fallback;
- AI audit;
- budget guard;
- forced fallback unit test.

## 11:30–13:30 — tools

- tool contracts/registry;
- recommend dispatch;
- blockers;
- mission summary;
- analytics;
- fleet comparison;
- tool audit.

## 14:30–16:00 — agent loop

- prompt;
- compact state context;
- max turns;
- operational question requires tool;
- deterministic degradation;
- UI console.

## 16:00–18:00 — scenario blueprint

- JSON schema/Zod;
- compiler;
- graph/references/ranges validation;
- feasible/impossible checks;
- deterministic generator.

## 18:00–20:00 — AI Scenario Architect

- structured output request;
- validation rejection → Luna;
- balance simulation;
- version persistence;
- page UI.

## 20:00–21:00 — failure drills

- wrong model ID;
- timeout;
- invalid JSON;
- no tool;
- disconnected map;
- both models fail.

### Gate дня 2

```text
DeepSeek tool call works; forced primary failure invokes Luna; invalid AI scenario never activates
```

# День 3 — аналитика, качество и сдача

## 09:00–11:00 — simulation analytics

- Monte Carlo;
- policies;
- percentiles;
- balance analyzer;
- counterfactuals;
- deterministic analytics DTO.

## 11:00–12:30 — analytics/ops UI

- KPI;
- economy;
- failures;
- utilization;
- comparison;
- Ops audit.

## 13:30–15:00 — tests

- property tests;
- integration matrix;
- E2E critical flow;
- SQL validation;
- syntax/structure scripts.

## 15:00–16:00 — Docker/CI

- Dockerfile;
- compose;
- healthcheck;
- GitHub Actions;
- clean start.

## 16:00–17:30 — docs

- README;
- architecture;
- data model;
- formulas;
- AI pipeline;
- limitations;
- acceptance matrix.

## 17:30–18:30 — evidence

- live AI evaluation;
- evidence report;
- screenshots;
- DB inspect;
- model verification.

## 18:30–19:30 — demo rehearsal

- reset;
- 90-second version;
- 5–7 minute version;
- fallback proof;
- no-key mode.

## 19:30–21:00 — buffer

Только blockers:

- build;
- startup;
- broken main flow;
- API key leak;
- DB corruption;
- README mismatch;
- layout overflow.

### Gate дня 3

```text
clean install + bootstrap + check + build + smoke + screenshots + 5-minute demo
```
