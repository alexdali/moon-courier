# Moon Courier Crisis

**Moon Courier Crisis** — небольшой, но целостный симулятор лунной логистики. Игрок управляет заказами, роверами, батареей, грузоподъёмностью, маршрутами, риском и экономикой миссии. AI встроен не как декоративный чат, а как **Mission Control**: он понимает запрос на естественном языке, вызывает детерминированные инструменты, предлагает назначения, объясняет ограничения и генерирует сценарии, которые затем проверяет обычный код.

Проект реализован как законченный vertical slice тестового задания: это не универсальная транспортная платформа, а разворачиваемый симулятор, в котором связаны продуктовый сценарий, доменное ядро, SQLite, HTTP API, AI routing, аналитика, тестирование и визуальная подача.

## 1. Что реализовано

### Игровое ядро

- стилизованная лунная карта с узлами, рёбрами и зонами;
- заказы с весом, наградой, штрафом, срочностью и дедлайном;
- роверы с батареей, ёмкостью аккумулятора, грузоподъёмностью, скоростью, расходом энергии и устойчивостью к риску;
- планирование полного пути: от текущего положения ровера до точки погрузки и затем до пункта доставки;
- четыре цели маршрута: `balanced`, `fastest`, `safest`, `efficient`;
- детерминированная проверка допустимости до запуска;
- seeded-разрешение риска с воспроизводимым результатом;
- успешные и неудачные доставки;
- зарядка и ремонт роверов как реальные экономические операции;
- цель миссии, ограничение по дням, банкротство, рейтинг и счёт;
- обязательный невозможный заказ `HAB-021`: 148 кг при максимальной грузоподъёмности флота 120 кг.

### Данные и аудит

- SQLite с SQL-миграциями;
- отдельные таблицы сценариев, версий сценария, миссий, карты, роверов, заказов, доставок, сегментов, событий, экономики, снимков состояния, симуляций и AI-аудита;
- атомарный запуск доставки в транзакции;
- idempotency key для защиты от повторного запуска;
- immutable snapshots после важных операций;
- журнал событий с последовательностью, временными отметками и payload;
- аудит моделей, входных/выходных и кэшированных токенов, стоимости, задержки, точных параметров, промптов, ошибок и tool calls;
- вкладка «Режим разработчика» внутри разбора миссии показывает сохранённую историю OpenRouter, включая записи, сделанные до появления подробного журнала.

### AI

- основной маршрут: `deepseek/deepseek-v4-flash-0731` через OpenRouter;
- явный application-level fallback: `openai/gpt-5.6-luna`;
- fallback включается после transport/API error, invalid JSON, schema rejection, tool failure или провала доменной валидации;
- strict structured output для генерации сценариев;
- tool calling для Mission Control;
- одинаковые детерминированные проверки для результата обеих моделей;
- дневной budget guard;
- приложение остаётся играбельным без API-ключа: используется rule-based помощник, но это **не локальная LLM**.

### Интерфейс

- основной экран Mission Control;
- Scenario Architect;
- Mission Debrief / аналитика;
- Ops / технические доказательства;
- экран About;
- двуязычный интерфейс `RU / EN` с переключателем в верхней панели и сохранением выбора;
- независимые сохраняемые настройки Mission Control: плотность «Простая»/«Подробная» и общая для всех экранов тема «Светлая»/«Тёмная»;
- AI Mission Control отвечает на языке запроса; быстрые подсказки соответствуют выбранному языку;
- сохранённые HTML-мокапы исходной визуальной концепции в `public/mockups/`;
- адаптивный интерфейс от мобильного экрана до рабочего стола 1440×900.

### Качество

- unit-тесты доменных правил;
- property-based тесты монотонности физических зависимостей;
- integration-тесты SQLite и use cases;
- E2E-тесты Playwright для невозможного заказа, доставки, вторичных экранов и `RU / EN`;
- seeded Monte Carlo balance check;
- health endpoint, smoke script, model verification, data export и evidence report;
- Dockerfile, Docker Compose и CI-конфигурация.

---

## 2. Главный архитектурный принцип

```text
React UI / HTTP API
        ↓
Application use cases
        ↓
Deterministic domain engine
        ↓
Ports / repository contracts
        ↓
SQLite, OpenRouter, system adapters
```

AI находится сбоку от расчётного ядра:

```text
User request
    ↓
DeepSeek primary
    ↓ tool selection / strict JSON
Application executes deterministic tools
    ↓
Validated result
    ↓
Luna fallback only when primary attempt is rejected or fails
```

**LLM не рассчитывает батарею, маршрут, риск, экономику или исход доставки.** Модель может только:

1. распознать намерение пользователя;
2. выбрать один из разрешённых инструментов;
3. передать структурированные аргументы;
4. объяснить уже рассчитанный результат;
5. предложить сценарий по строгой схеме.

Сервер выполняет инструменты, проверяет результат и сохраняет audit trail.

---

## 3. Стек

```text
Web/UI            Next.js 16 App Router + React 19 + TypeScript
State             Zustand
Validation        Zod + JSON Schema
Persistence       SQLite + better-sqlite3 + ordered SQL migrations
Logging           Pino
AI gateway        OpenRouter Chat Completions API
Primary model     deepseek/deepseek-v4-flash-0731
Fallback model    openai/gpt-5.6-luna
Testing           Vitest + fast-check + Playwright
Deployment        Docker / Docker Compose / single Node process
```

---

## 4. Быстрый запуск

### Требования

- Node.js 22+;
- npm;
- интернет только для AI-вызовов;
- OpenRouter API key — необязателен для игры, обязателен для online AI.

### Локально

```bash
cp .env.example .env
npm ci
npm run bootstrap
npm run dev
```

Открыть:

```text
http://localhost:3000
```

HTML-мокапы:

```text
http://localhost:3000/mockups/overview.html
```

### AI-конфигурация

В `.env`:

```dotenv
OPENROUTER_API_KEY=ваш_ключ
AI_ENABLED=true
AI_PRIMARY_MODEL=deepseek/deepseek-v4-flash-0731
AI_FALLBACK_MODEL=openai/gpt-5.6-luna
```

Проверить доступность model IDs:

```bash
npm run verify:models
```

Без ключа:

- игра, карта, расчёты, доставка, события, экономика, аналитика и симуляция работают;
- Mission Control отвечает ограниченными rule-based подсказками;
- AI Scenario Architect создаёт детерминированный валидный сценарий;
- никакая локальная LLM не запускается.

### Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

SQLite хранится в именованном volume.

### Проверенный baseline

[Актуальный отчёт о проверках и baseline](docs/VALIDATION_REPORT.md).

---

## 5. Основные команды

```bash
npm run dev                 # Next.js dev server
npm run build               # production build
npm run start               # production server
npm run bootstrap           # migrations + demo seed

npm run db:migrate
npm run db:seed
npm run db:inspect
npm run db:reset
npm run game:reset

npm run simulate            # Monte Carlo для demo scenario
npm run verify:models       # проверить DeepSeek и Luna в OpenRouter
npm run evaluate:ai         # live benchmark на фиксированных кейсах
npm run report              # reports/demo-evidence.md
npm run export:data         # JSON export
npm run screenshots         # Playwright screenshot set
npm run smoke               # HTTP smoke при запущенном приложении

npm run validate            # полный local quality gate
npm run check:static        # docs links + mockup assets + secrets
npm run check:docs
npm run check:assets
npm run check:secrets
npm run typecheck
npm run lint
npm run test
npm run test:unit
npm run test:integration
npm run test:property
npm run test:e2e
npm run test:coverage
npm run check
npm run clean
```

---

## 6. Как работают правила

[Правила игры](docs/GAME_RULES.md) и [формулы расчётов](docs/FORMULAS.md).

---

## 7. Где хранятся данные

По умолчанию:

```text
data/moon-courier.db
```

Ключевые таблицы:

```text
scenarios
scenario_versions
missions
zones
map_nodes
map_edges
rovers
orders
deliveries
delivery_segments
events
economy_entries
mission_snapshots
simulation_runs
simulation_samples
ai_runs
ai_tool_calls
```

Схема и инварианты: [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).

---

## 8. AI fallback

Fallback реализован явно в `src/modules/ai/routing/model-router.ts`.

```text
DeepSeek attempt
  ├─ success + validation pass → accept
  └─ provider/timeout/JSON/schema/domain/tool failure
          ↓
       Luna attempt
          ├─ success + same validation → accept
          └─ failure → deterministic degraded behavior
```

Почему не используется скрытый provider fallback:

- в БД виден каждый отдельный model attempt;
- понятна точная причина переключения;
- стоимость и latency считаются отдельно;
- Luna получает тот же контракт и проходит тот же gate;
- fallback можно воспроизвести тестом.

Подробно: [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md).

---

## 9. Локальная модель

Локальная LLM **не реализуется в текущем MVP**. В README и архитектуре зафиксирован только будущий путь:

- добавить `LocalAiProvider` за существующим портом;
- использовать Qwen-класс модели через Ollama/llama.cpp;
- сохранить те же tool schemas, Zod validation и audit contract;
- не менять доменный движок.

Это сознательное ограничение: за три дня надёжнее довести online DeepSeek → Luna и продуктовый сценарий, чем тратить время на CPU-инференс и упаковку весов.

Подробно: [`docs/LOCAL_MODEL_FUTURE.md`](docs/LOCAL_MODEL_FUTURE.md).

---

## 10. Карта файлов

Подробное назначение модулей:

[`docs/FILE_MAP.md`](docs/FILE_MAP.md)

Ключевые точки входа:

```text
src/app/page.tsx
src/components/mission/mission-control.tsx
src/domain/routing/route-planner.ts
src/domain/rules/feasibility.ts
src/domain/simulation/delivery-resolver.ts
src/domain/simulation/mission-simulator.ts
src/application/use-cases/launch-delivery.ts
src/modules/ai/routing/model-router.ts
src/modules/ai/agents/mission-control-agent.ts
src/modules/ai/scenarios/scenario-generator.ts
src/infrastructure/db/repositories/sqlite-repository-bundle.ts
migrations/0001_initial.sql
```

---

## 11. Документация

Начать с [`docs/README.md`](docs/README.md).

Главные документы:

- [`docs/FINAL_IMPLEMENTATION_PLAN.md`](docs/FINAL_IMPLEMENTATION_PLAN.md) — полный план;
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — границы и data flow;
- [`docs/GAME_RULES.md`](docs/GAME_RULES.md) — правила игры;
- [`docs/AI_PIPELINE.md`](docs/AI_PIPELINE.md) — DeepSeek → Luna;
- [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md) — стратегия качества;
- [`docs/ACCEPTANCE_MATRIX.md`](docs/ACCEPTANCE_MATRIX.md) — соответствие заданию;
- [`docs/THREE_DAY_PLAN.md`](docs/THREE_DAY_PLAN.md) — реализация по часам;
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — защита за 5–7 минут;
- [`docs/VALIDATION_REPORT.md`](docs/VALIDATION_REPORT.md) — что проверено в поставляемом архиве.

---

## 12. Готовый сценарий для демонстрации

1. Открыть Mission Control и показать карту, заказы, роверы и цель.
2. Выбрать `HAB-021` + любой ровер: кнопка запуска заблокирована из-за грузоподъёмности.
3. Выбрать `MED-017` + `ATLAS-1`: показать ETA, батарею, риск и ожидаемую прибыль.
4. Запустить доставку: показать replay, событие риска, состояние заказа, батарею и баланс.
5. Спросить Mission Control о лучшем назначении и раскрыть использованные tools.
6. Сгенерировать сценарий: показать JSON/schema/domain/balance validation.
7. Открыть Analytics и сравнить текущий флот с дополнительным тяжёлым ровером.
8. Открыть Ops: AI attempts, model role, tokens, cost и события.
9. Завершить кодом fallback и одним unit/integration test.

---

## 13. Текущие ограничения MVP

- нет пользователей и авторизации;
- нет real-time multiplayer;
- нет 3D-физики;
- карта — граф, а не GIS;
- заказ неделимый и обслуживается одним ровером;
- нет одновременного движения нескольких роверов во времени;
- SQLite рассчитан на один экземпляр приложения;
- AI-ответ вероятностный, поэтому всегда проходит валидацию или заменяется deterministic fallback;
- цены и доступность моделей нужно проверить перед запуском;
- локальная LLM не реализована.

Полный список: [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

---

## 14. Лицензия

MIT-like учебная лицензия в [`LICENSE`](LICENSE).
