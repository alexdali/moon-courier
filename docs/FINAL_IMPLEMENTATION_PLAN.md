# Окончательный план реализации Moon Courier Crisis

## 0. Цель

За три дня получить работающий vertical slice:

```text
выбор заказа и ровера
→ расчёт полного маршрута
→ проверка груза, батареи и статусов
→ preview времени, риска и экономики
→ атомарный запуск
→ seeded resolution событий
→ обновление заказа, ровера, миссии и денег
→ сохранение delivery/event/ledger/snapshot
→ AI Mission Control через tools
→ DeepSeek primary → Luna fallback
→ аналитика и контрфактическая симуляция
```

Критерий успеха: проверяющий за 5–7 минут видит, что интерфейс красивый, правила действительно работают, данные сохраняются, AI встроен в пользовательский сценарий, а результаты можно проверить и воспроизвести.

---

# 1. Product scope

## 1.1 Обязательный сценарий пользователя

1. Пользователь открывает Mission Control.
2. Видит карту, базу, колонии, рискованные зоны, 3 ровера и 6 заказов.
3. Выбирает заказ.
4. Выбирает ровер.
5. Система рассчитывает:
   - полный путь;
   - расстояние;
   - ETA;
   - расход энергии;
   - остаток батареи;
   - загрузку;
   - риск;
   - вероятность успеха;
   - ожидаемый финансовый результат.
6. При нарушении ограничений запуск блокируется с конкретными причинами.
7. При допустимом назначении пользователь запускает доставку.
8. Сервер один раз разрешает результат по seed и сохраняет его.
9. Клиент только проигрывает уже сохранённые события.
10. После результата меняются статус заказа, батарея, позиция/статус ровера, деньги, счёт, рейтинг и журнал.
11. Пользователь может зарядить или отремонтировать ровер.
12. Пользователь задаёт Mission Control вопрос на естественном языке.
13. AI вызывает детерминированный tool и объясняет его данные.
14. Пользователь открывает аналитику и сравнивает варианты флота.

## 1.2 Обязательный невозможный сценарий

`HAB-021`:

```text
weight: 148 kg
fleet max capacity: 120 kg
```

Инвариант:

```text
для любого ровера и любого уровня батареи
feasibility.status = impossible
blocking reason contains CAPACITY_EXCEEDED
```

Этот сценарий покрывается unit-, property-, integration- и E2E-тестом.

## 1.3 Игровая цель

Demo scenario:

- длительность: 7 дней;
- стартовые средства: 2400 CR;
- цель: 3200 CR;
- проигрыш: отрицательный баланс, выход за срок или завершение всех доступных заказов ниже цели;
- победа: достижение целевого баланса.

## 1.4 Не входит в MVP

- пользователи;
- мультиплеер;
- сложная 3D-физика;
- реальный географический routing;
- одновременная timeline-симуляция нескольких роверов;
- обучение модели;
- локальный AI runtime;
- production-grade distributed queue.

---

# 2. Engineering principles

## 2.1 Deterministic core

Все правила, влияющие на деньги и состояние, находятся в `src/domain` и не импортируют:

- React;
- Next.js;
- SQLite;
- OpenRouter;
- environment;
- системное время.

## 2.2 AI is an interpreter, not an oracle

AI:

- понимает естественный язык;
- выбирает tool;
- создаёт scenario blueprint;
- объясняет рассчитанные данные.

AI не может:

- менять mission state напрямую;
- выполнять SQL;
- придумывать число батареи;
- самостоятельно решать, возможна ли доставка;
- определять исход риска;
- начислять деньги.

## 2.3 Server authority

Клиент не определяет исход доставки. `POST /api/dispatch/launch`:

1. открывает транзакцию;
2. проверяет idempotency key;
3. перечитывает актуальное состояние;
4. пересчитывает preview;
5. блокирует невозможное назначение;
6. генерирует delivery seed;
7. разрешает сегменты;
8. пишет все изменения;
9. коммитит;
10. возвращает replay.

## 2.4 Evidence over claims

Вместо фразы «AI работает» проект сохраняет:

- model ID;
- роль primary/fallback;
- prompt version;
- input/output tokens;
- cost;
- latency;
- raw response;
- error/rejection;
- tool calls;
- tool arguments;
- tool result;
- deterministic validation report.

## 2.5 Reproducibility

Случайность получает seed на уровнях:

- scenario;
- mission;
- delivery;
- simulation sample.

При одинаковых входах результат воспроизводим.

---

# 3. Стек

## 3.1 Web

- Next.js App Router;
- React;
- TypeScript strict mode;
- server components для initial data;
- client components только для интерактивности;
- Zustand для локального mission UI state;
- plain CSS design system, чтобы не тратить время на зависимость от component framework.

## 3.2 Persistence

- SQLite;
- `better-sqlite3`;
- SQL migrations;
- repository adapters;
- WAL для file database;
- foreign keys;
- busy timeout;
- транзакции.

## 3.3 AI

- OpenRouter Chat Completions;
- DeepSeek V4 Flash 0731 primary;
- GPT-5.6 Luna fallback;
- Fetch API без тяжёлого agent framework;
- JSON Schema structured output;
- tool calling;
- Zod post-validation;
- application-level audit/fallback.

## 3.4 Quality

- Vitest;
- fast-check;
- Playwright;
- ESLint;
- Prettier;
- Pino;
- GitHub Actions.

---

# 4. Архитектурные слои

## 4.1 `src/domain`

Содержит entities, rules, routing, planning, simulation, scenarios, analytics и state machines.

Запрещено:

- SQL;
- HTTP;
- environment variables;
- framework types;
- global random;
- `new Date()` в расчётных функциях.

## 4.2 `src/application`

Содержит:

- ports;
- DTO;
- request schemas;
- state readers/factories;
- use cases.

Use case отвечает за транзакцию и orchestration, но не дублирует формулы.

## 4.3 `src/infrastructure`

Содержит:

- SQLite client;
- migrations runner;
- repositories;
- metrics query repository;
- logger;
- rate limiter;
- system clock;
- UUID generator;
- dependency composition.

## 4.4 `src/modules/ai`

Содержит:

- OpenRouter transport;
- request/response contracts;
- explicit model router;
- prompt builders;
- agent loop;
- tool registry;
- scenario generator;
- budget/cost audit;
- deterministic degraded assistant.

## 4.5 `src/app`, `src/components`, `src/hooks`, `src/stores`

Presentation + HTTP delivery. Ни один компонент не импортирует SQLite repository напрямую.

---

# 5. Domain model

## 5.1 Scenario

Сценарий является неизменяемым шаблоном:

- rules;
- world graph;
- rover templates;
- order templates;
- seed;
- source;
- difficulty.

## 5.2 Mission

Mission — runtime instance сценария:

- current time/day;
- credits;
- score;
- rating;
- status;
- target;
- start/end timestamps.

## 5.3 World

World — граф:

- zones;
- nodes;
- edges.

Zone влияет на speed, energy и risk. Edge содержит distance, terrain factors и base risk.

## 5.4 Rover

Rover runtime state:

- current node;
- battery;
- status;
- immutable capabilities.

## 5.5 Order

Order runtime state:

- origin/destination;
- weight;
- reward/failure penalty;
- urgency/deadline;
- status;
- impossible reason.

## 5.6 Delivery

Delivery хранит:

- selected pair;
- planned route;
- expected net;
- actual net;
- seed;
- terminal status;
- failure code;
- idempotency key.

## 5.7 Event and economy ledger

Event отвечает на вопрос «что произошло».

Economy entry отвечает на вопрос «как изменился баланс».

Они не объединяются в одну таблицу, потому что одно событие может не иметь финансового эффекта, а финансовая операция должна быть удобна для суммирования и аудита.

---

# 6. Routing and feasibility

## 6.1 Full route

Если ровер не находится в origin заказа:

```text
rover node → order origin  (empty load)
order origin → destination (loaded)
```

Сегменты объединяются в один `PlannedRoute`.

## 6.2 Objectives

- `fastest`: минимальный duration;
- `safest`: минимальный risk-weighted cost;
- `efficient`: минимальный energy/economy cost;
- `balanced`: комбинированная функция.

## 6.3 Blocking checks

- order status;
- rover status;
- capacity;
- connected path;
- battery reserve.

## 6.4 Warnings

- высокий риск;
- projected missed deadline;
- пользовательский risk limit.

Warning не запрещает запуск; blocker запрещает.

---

# 7. Delivery resolution

Для каждого route segment:

1. списать рассчитанную энергию;
2. увеличить mission time;
3. сохранить movement event;
4. взять seeded incident roll;
5. при инциденте взять severity roll;
6. применить delay, battery loss или cargo damage;
7. остановить traversal при terminal failure.

После traversal:

- энергия считается только по фактически пройденным сегментам;
- начисляется late penalty;
- при успехе начисляется reward;
- при провале начисляется failure penalty;
- rover становится `damaged`, но стоимость ремонта списывается только отдельной repair operation;
- сохраняются delivery, segments, events, ledger и snapshot.

---

# 8. AI Mission Control

## 8.1 Tools

MVP tools:

```text
recommend_dispatch
explain_dispatch_blockers
get_mission_summary
get_delivery_analytics
compare_fleet_options
```

Каждый tool:

- имеет JSON Schema;
- парсит аргументы;
- читает mission state через repositories;
- вызывает domain/application функции;
- возвращает structured data и краткий summary;
- не изменяет состояние.

## 8.2 Agent loop

Максимум 4 tool turns:

1. отправить state summary + user message + tool definitions;
2. получить tool calls;
3. выполнить tools на сервере;
4. сохранить tool audit;
5. добавить tool results в messages;
6. запросить финальное объяснение;
7. отклонить operational answer без tool call.

## 8.3 Fallback

DeepSeek и Luna вызываются последовательно самим приложением.

Fallback reasons:

- timeout;
- HTTP/provider error;
- empty response;
- invalid tool JSON;
- unknown tool;
- tool execution failure;
- model завершила operational request без tool;
- exceeded tool turns;
- invalid scenario JSON;
- Zod/JSON Schema failure;
- disconnected map;
- отсутствует feasible pair;
- отсутствует impossible order;
- scenario not survivable.

## 8.4 Third-level degradation

Если обе модели недоступны:

- game remains functional;
- assistant uses deterministic templates;
- scenario generator uses deterministic blueprint;
- UI explicitly marks deterministic mode;
- это не считается Luna success и не маскируется в AI audit.

---

# 9. Scenario Architect

Pipeline:

```text
natural-language brief
→ strict ScenarioBlueprint JSON
→ Zod parse
→ compile IDs/references
→ graph validation
→ rules/ranges validation
→ feasible pair matrix
→ required impossible order check
→ gross target upper-bound check
→ 80-run balance simulation
→ persist scenario version
```

Scenario не активируется автоматически. Пользователь видит validation report и нажимает Activate.

---

# 10. Analytics

Детерминированные read models:

- mission KPIs;
- economy timeline;
- failure breakdown;
- rover utilization;
- evidence metadata.

Counterfactuals:

- baseline;
- extra heavy rover;
- 30% faster charging.

Каждый вариант прогоняется на одинаковой policy и comparable seeds.

AI может сформулировать вывод, но числа приходят из simulation summary.

---

# 11. Persistence design

## 11.1 Current projection

`missions`, `rovers`, `orders` содержат текущее состояние для быстрых чтений UI.

## 11.2 Immutable evidence

`deliveries`, `delivery_segments`, `events`, `economy_entries`, `mission_snapshots`, `scenario_versions`, `simulation_samples`, `ai_runs`, `ai_tool_calls` позволяют объяснить, откуда появился результат.

## 11.3 Transactions

Одна delivery transaction включает весь read/validate/resolve/write. Это защищает от:

- двойного клика;
- stale preview;
- частично записанного результата;
- баланса без delivery;
- delivery без events.

## 11.4 Idempotency

Client генерирует idempotency key. Повторный запрос возвращает существующий delivery replay и не создаёт новые записи.

---

# 12. HTTP API

Read:

```text
GET /api/health
GET /api/mission
GET /api/scenarios
GET /api/analytics
GET /api/ops/summary
```

Commands:

```text
POST /api/dispatch/preview
POST /api/dispatch/launch
POST /api/rovers/:id/charge
POST /api/rovers/:id/repair
POST /api/ai/assistant
POST /api/scenarios/generate
POST /api/scenarios/:id/activate
POST /api/analytics/simulate
POST /api/mission/reset
```

Error contract:

```json
{
  "error": "DISPATCH_IMPOSSIBLE",
  "message": "Dispatch is impossible for the selected order and rover",
  "details": {}
}
```

---

# 13. Testing

## 13.1 Unit

- load;
- speed;
- energy;
- risk;
- feasibility;
- route planner;
- economy estimate;
- dispatch score;
- delivery resolver;
- charging;
- repair;
- goal;
- scenario validation;
- balance;
- OpenRouter parser;
- model router fallback;
- scenario schema.

## 13.2 Property

- energy is monotonic by distance/load;
- speed does not grow with load;
- risk stays bounded;
- risk falls with resistance;
- same seed returns same simulation;
- outcome counts do not exceed orders;
- HAB-021 remains impossible at any battery.

## 13.3 Integration

- migrations + seed;
- persistence counts;
- impossible dispatch no mutation;
- feasible delivery lifecycle;
- idempotency;
- charging;
- repair;
- analytics evidence;
- scenario versions;
- transaction rollback;
- AI/tool audit.

## 13.4 E2E

- health;
- main screen;
- mandatory impossible flow;
- feasible launch;
- scenario page;
- analytics page.

## 13.5 Live AI evaluation

Не запускается в обычном CI. Фиксированный набор запросов измеряет:

- primary pass rate;
- fallback rate;
- schema/tool compliance;
- latency p50/p95;
- token usage;
- cost;
- human usefulness score.

---

# 14. Security and cost

## 14.1 Secrets

- key только server-side;
- `.env` в `.gitignore`;
- logger redact;
- raw key не попадает в audit.

## 14.2 AI safety

- user text — data, not system instruction;
- tools whitelist;
- no arbitrary SQL/tool names;
- strict arguments;
- read-only AI tools;
- max tool turns;
- timeout;
- output token cap;
- domain validation;
- fail closed for scenario generation.

## 14.3 Cost guard

- daily budget;
- configurable prices;
- no AI in core game loop;
- max output;
- one primary + one fallback;
- actual usage audit;
- model benchmark manual only.

## 14.4 Public deployment

Перед публичным доступом добавить:

- auth or CAPTCHA;
- durable distributed rate limit;
- CSRF review;
- stronger admin token;
- backup;
- TLS;
- security headers.

---

# 15. Observability

Structured log fields:

```text
requestId
missionId
scenarioId
deliveryId
aiRunId
model
modelRole
latencyMs
costUsd
errorCode
```

Persistent evidence:

- DB counts;
- recent AI runs;
- recent simulations;
- events;
- snapshots;
- economy ledger.

Ops screen должен показывать эти данные без ручного просмотра БД.

---

# 16. Deployment

## MVP

```text
single Node/Next.js process
SQLite volume
reverse proxy / HTTPS
```

Ресурсы:

```text
1–2 vCPU
1–2 GB RAM
persistent disk
```

AI inference выполняется удалённо.

## Upgrade triggers

PostgreSQL нужен при:

- нескольких replicas;
- параллельной записи;
- serverless без persistent shared disk;
- BI/SQL analytics;
- PITR requirements.

Redis/queue нужен, когда simulations/AI становятся долгими background jobs.

---

# 17. Трёхдневная реализация

## День 1 — deterministic game

Результат дня:

- база и migrations;
- demo scenario;
- карта;
- orders/rovers;
- routing;
- feasibility;
- dispatch preview;
- launch transaction;
- event/economy persistence;
- impossible scenario;
- основная визуальная оболочка.

Gate:

```text
без AI можно пройти полный игровой цикл
```

## День 2 — AI and scenarios

Результат дня:

- OpenRouter transport;
- DeepSeek/Luna router;
- AI audit;
- tools;
- Mission Control;
- scenario schema/generator;
- validation and balance;
- deterministic degradation;
- AI unit tests.

Gate:

```text
один operational question вызывает tool;
один forced primary failure приводит к Luna;
invalid scenario is rejected
```

## День 3 — analytics and proof

Результат дня:

- Monte Carlo;
- counterfactuals;
- analytics screen;
- Ops;
- property/integration/E2E tests;
- Docker;
- CI;
- README/docs;
- screenshots;
- demo rehearsal.

Gate:

```text
clean start + check + build + smoke + 5-minute demo
```

---

# 18. Definition of done

## Product

- [ ] карта видна и читается;
- [ ] точки заказов видны;
- [ ] 3+ ровера;
- [ ] 6+ заказов;
- [ ] выбор пары работает;
- [ ] preview работает;
- [ ] launch меняет состояние;
- [ ] успех и провал возможны;
- [ ] зарядка и ремонт работают;
- [ ] цель миссии видна;
- [ ] HAB-021 невозможно запустить.

## Domain

- [ ] weight affects capacity, energy and speed;
- [ ] battery blocks dispatch;
- [ ] zones affect speed/risk/energy;
- [ ] risk affects result;
- [ ] seed reproduces result;
- [ ] client cannot choose result.

## Data

- [ ] restart сохраняет состояние;
- [ ] delivery atomic;
- [ ] idempotency prevents duplicates;
- [ ] events saved;
- [ ] economy ledger saved;
- [ ] snapshots saved;
- [ ] scenario versions saved;
- [ ] AI audit saved.

## AI

- [ ] DeepSeek primary;
- [ ] Luna explicit fallback;
- [ ] tools are deterministic;
- [ ] scenario strict output;
- [ ] same validation gate;
- [ ] budget cap;
- [ ] offline/degraded mode honest;
- [ ] local model not claimed as implemented.

## Quality

- [ ] typecheck;
- [ ] lint;
- [ ] unit tests;
- [ ] property tests;
- [ ] integration tests;
- [ ] build;
- [ ] smoke;
- [ ] E2E critical flow;
- [ ] README verified on clean machine.

## Submission

- [ ] repository link;
- [ ] screenshots;
- [ ] README;
- [ ] no secrets;
- [ ] exact run commands;
- [ ] limitations;
- [ ] validation report.
