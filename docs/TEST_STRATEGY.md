# Стратегия тестирования

## 1. Цель

Тесты должны доказывать свойства задания, а не только повышать coverage.

## 2. Test pyramid

```text
E2E          критические пользовательские потоки
Integration  транзакции, persistence, idempotency, audit
Property     общие физические инварианты
Unit         формулы, planners, validators, parsers
```

## 3. Unit matrix

| Область | Проверки |
|---|---|
| Load | ratio, utilization, deficit |
| Speed | load/terrain reduce speed |
| Energy | distance/load increase consumption |
| Risk | bounded, resistance lowers risk |
| Route | connected full route, origin included |
| Feasibility | capacity, battery, status, no route |
| Economy | energy/risk/lateness reduce expected net |
| Planner | ignores impossible and excluded candidates |
| Resolver | deterministic same seed, state/economy/events |
| Charging | station faster than field, time/cost |
| Repair | damaged → available, time/cost |
| Goal | target/duration/bankruptcy |
| Scenario | graph, refs, impossible order, target bound |
| AI parser | plain/fenced JSON, invalid rejection |
| Model router | primary failure → Luna, both audited |

## 4. Property tests

Главные свойства:

```text
energy(distance + Δ) >= energy(distance)
energy(load + Δ) >= energy(load)
speed(load + Δ) <= speed(load)
0 <= risk <= 0.95
risk(resistance + Δ) <= risk(resistance)
sim(seed) == sim(seed)
terminal outcomes <= orders
HAB-021 impossible for any battery
```

Используется 80–300 generated cases на property.

## 5. Integration tests

In-memory SQLite с настоящими migrations и repositories:

- demo bootstrap;
- DB counts;
- mandatory impossible preview;
- rejected launch causes no writes;
- feasible launch writes all aggregates;
- idempotent replay;
- charging ledger/event;
- repair ledger/event;
- analytics evidence;
- scenario versions;
- transaction rollback;
- AI/tool audit upsert.

## 6. E2E

Desktop Chromium 1440×900:

- `/api/health`;
- main screen;
- select `HAB-021` + `ATLAS-1`;
- disabled launch and capacity reason;
- select feasible pair;
- launch and result panel;
- scenario/analytics pages.

## 7. Live AI evaluation

Команда:

```bash
npm run evaluate:ai
```

Кейсы:

- recommend safest critical;
- explain impossible pair;
- compare fleet options;
- mission summary;
- generate normal scenario;
- generate hard scenario with impossible order.

Метрики:

```text
accepted / rejected / failed
primary pass rate
fallback rate
schema/tool compliance
latency
input/output tokens
cost
```

Live evaluation не входит в CI: она платная и недетерминированная.

## 8. Mutation-style manual checks

Перед сдачей намеренно сломать и убедиться, что тест ловит:

- убрать capacity check;
- использовать Math.random;
- дважды начислить reward;
- разрешить client-supplied result;
- убрать unique idempotency key;
- принять disconnected scenario;
- позволить AI ответить operational цифрами без tool.

## 9. CI gates

```text
install
syntax/structure/sql
 typecheck
lint
unit + property + integration
build
optional E2E
```

## 10. Coverage target

Не гнаться за 100%. Цель:

- domain rules/simulation: 90%+ statements;
- application commands: 80%+;
- AI routing/parsing: критические branches;
- UI: E2E critical flow.
