# ADR-0004: Explicit DeepSeek → Luna routing

- Status: Accepted
- Date: 2026-08-14

## Context

Нужна дешёвая основная модель, более надёжный fallback и доказуемое использование AI.

## Decision

Вызывать DeepSeek первым. При provider-, timeout-, JSON-, schema-, domain- или tool-error выполнять отдельную попытку Luna. Каждую попытку сохранять в `ai_runs`; не использовать непрозрачный gateway fallback.

## Consequences

Причина fallback, стоимость и latency видны. Оба результата проходят одинаковый deterministic gate. После отказа обеих моделей продукт переходит в rule-based degraded mode, а не ломает игровой сценарий.
