# Архитектура

## 1. Формат решения

Проект — modular monolith: один Next.js deployment unit, внутри которого слои изолированы контрактами. Это компромисс между скоростью тестового задания и возможностью дальнейшего роста.

```mermaid
flowchart LR
  UI[React UI] --> API[Next.js Route Handlers]
  API --> UC[Application Use Cases]
  UC --> DOMAIN[Deterministic Domain]
  UC --> PORTS[Ports]
  PORTS --> SQL[SQLite adapters]
  PORTS --> AI[AI service]
  AI --> ROUTER[DeepSeek → Luna Router]
  ROUTER --> OR[OpenRouter]
  AI --> TOOLS[Deterministic Tool Registry]
  TOOLS --> DOMAIN
  SQL --> DB[(SQLite)]
```

## 2. Dependency rule

Разрешённое направление импорта:

```text
presentation → application → domain
infrastructure → application/domain contracts
AI adapters → application/domain contracts
```

Запрещено:

```text
domain → Next.js
 domain → SQLite
 domain → OpenRouter
 domain → process.env
```

## 3. Command/query split

### Commands

- launch delivery;
- charge rover;
- repair rover;
- activate scenario;
- reset mission;
- generate scenario;
- run persisted simulation.

Commands выполняются use case и при изменении данных используют транзакцию.

### Queries

- mission dashboard;
- dispatch preview;
- analytics;
- ops summary;
- scenario list.

Queries не меняют состояние.

## 4. Главный transactional flow

```mermaid
sequenceDiagram
  participant UI
  participant API
  participant UC as LaunchDeliveryUseCase
  participant DB
  participant Domain

  UI->>API: POST /dispatch/launch + idempotencyKey
  API->>UC: validated command
  UC->>DB: BEGIN
  UC->>DB: find by idempotency key
  UC->>DB: read mission/order/rover/scenario
  UC->>Domain: planRoute + feasibility
  Domain-->>UC: route + blockers
  UC->>Domain: resolveDelivery(seed)
  Domain-->>UC: delivery + events + ledger + new state
  UC->>DB: insert delivery/segments/events/ledger/snapshot
  UC->>DB: update mission/order/rover
  UC->>DB: COMMIT
  UC-->>API: persisted replay
  API-->>UI: replay
  UI->>UI: animate stored events
```

## 5. AI flow

```mermaid
sequenceDiagram
  participant User
  participant Agent
  participant Router
  participant DS as DeepSeek
  participant Tool
  participant Luna
  participant Audit

  User->>Agent: natural-language request
  Agent->>Router: attempt contract
  Router->>Audit: start primary
  Router->>DS: tools + state summary
  DS-->>Agent: tool call
  Agent->>Tool: validated args
  Tool-->>Agent: deterministic result
  Agent->>DS: tool result
  DS-->>Agent: explanation
  alt accepted
    Router->>Audit: primary succeeded
  else failure/rejection
    Router->>Audit: primary failed/rejected
    Router->>Audit: start fallback
    Router->>Luna: same contract
    Luna-->>Router: accepted result
    Router->>Audit: fallback succeeded
  end
```

## 6. Composition root

`src/infrastructure/composition/app-container.ts` — единственное место, где собираются concrete adapters:

- database;
- repositories;
- transaction runner;
- clock;
- id generator;
- AI service;
- use cases.

Это облегчает тестирование: integration tests создают in-memory SQLite и подменяют clock/id generator.

## 7. Runtime boundaries

- все DB и AI routes используют Node runtime;
- AI key доступен только серверу;
- browser получает DTO, а не database rows;
- static HTML mockups лежат отдельно в `public/mockups`;
- Next UI не зависит от mockup JavaScript.

## 8. Scale-out path

### Stage 1

```text
Next.js + SQLite
```

### Stage 2

```text
Next.js + PostgreSQL
background worker for simulations
```

### Stage 3

```text
web replicas
PostgreSQL
Redis queue
simulation workers
observability stack
```

Доменный слой и AI tool contracts при этом не меняются.
