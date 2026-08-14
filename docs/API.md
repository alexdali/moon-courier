# HTTP API

Все ответы `Cache-Control: no-store`.

## Error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {}
}
```

## `GET /api/health`

Возвращает DB status и configured AI models.

## `GET /api/mission`

Текущий `MissionDashboardDto`.

## `POST /api/mission/reset`

Сбрасывает demo mission.

## `POST /api/dispatch/preview`

```json
{
  "missionId": "mission_shackleton_demo",
  "orderId": "...",
  "roverId": "...",
  "objective": "balanced"
}
```

Возвращает route, feasibility, economy и success probability.

## `POST /api/dispatch/launch`

```json
{
  "missionId": "...",
  "orderId": "...",
  "roverId": "...",
  "objective": "balanced",
  "idempotencyKey": "browser-generated-uuid"
}
```

Возвращает persisted delivery replay.

## `POST /api/rovers/:id/charge`

```json
{
  "missionId": "...",
  "targetBatteryPercent": 100
}
```

## `POST /api/rovers/:id/repair`

```json
{
  "missionId": "..."
}
```

## `POST /api/ai/assistant`

```json
{
  "missionId": "...",
  "message": "Recommend the safest critical dispatch",
  "selectedOrderId": "...",
  "selectedRoverId": "..."
}
```

## `GET /api/scenarios`

Список scenario templates.

## `POST /api/scenarios/generate`

```json
{
  "prompt": "Create a hard seven-day medical surge scenario...",
  "seed": 384719,
  "difficulty": "hard",
  "durationDays": 7
}
```

## `POST /api/scenarios/:id/activate`

Создаёт новую mission instance.

## `GET /api/analytics?iterations=80`

Возвращает KPIs, charts, evidence и counterfactual summaries.

## `POST /api/analytics/simulate`

```json
{
  "iterations": 300
}
```

## `GET /api/ops/summary`

Счётчики, recent AI runs и recent simulations.
