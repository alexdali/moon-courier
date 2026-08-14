# Сценарий демонстрации

## Версия на 90 секунд

1. Открыть `/`.
2. Коротко показать карту, 3 ровера, 6 заказов и цель 3200 CR.
3. Выбрать `HAB-021` + `ATLAS-1`.
4. Показать `Dispatch impossible` и дефицит 28 кг.
5. Выбрать `MED-017` + `ATLAS-1`.
6. Показать ETA, батарею после маршрута, risk и expected net.
7. Нажать Launch; показать replay и изменение состояния.
8. Нажать AI Recommend; раскрыть used tools.
9. Открыть Analytics и показать counterfactual heavy rover.
10. Сказать: DeepSeek primary, Luna explicit fallback, домен детерминирован.

## Версия на 5–7 минут

### 0:00–0:40 — продукт

- Это операционный симулятор в игровой оболочке.
- Главные сущности: tasks, resources, constraints, risk, economy.

### 0:40–1:30 — обязательные правила

- HAB-021 impossible;
- capacity blocker не зависит от батареи;
- показать low-battery rover;
- переключить route objective.

### 1:30–2:30 — доставка

- feasible pair;
- preview;
- launch;
- replay events;
- battery/order/credits update;
- указать server authority/idempotency.

### 2:30–3:30 — AI Mission Control

- запросить safest critical dispatch;
- показать tool call;
- применить selection;
- объяснить: модель не вычисляет цифры.

### 3:30–4:30 — Scenario Architect

- prompt;
- strict JSON;
- validation list;
- impossible order;
- balance success rate;
- seed.

### 4:30–5:20 — Analytics

- ledger-based economy;
- failure breakdown;
- fleet utilization;
- extra-heavy rover counterfactual.

### 5:20–6:10 — engineering proof

- `delivery-resolver.ts`;
- `launch-delivery.ts`;
- `model-router.ts`;
- SQLite tables;
- one property/integration test.

### 6:10–6:40 — fallback

- показать unit test или audit с primary failed → fallback succeeded;
- Luna проходит тот же gate.

### 6:40–7:00 — ограничения

- local model not implemented;
- no users/multiplayer;
- SQLite single instance;
- next production step.

## Forced fallback demo

Без намеренного live sabotage лучше показать test/audit fixture. Если нужен live:

1. временно задать invalid primary model;
2. перезапустить;
3. выполнить AI request;
4. показать `ai_runs`: primary failed, Luna succeeded;
5. вернуть env.

Не делать это на последней минуте перед сдачей без предварительной репетиции.
