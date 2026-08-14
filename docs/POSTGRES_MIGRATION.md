# Путь SQLite → PostgreSQL

## Когда переходить

- несколько web replicas;
- background workers с записью;
- managed/serverless deployment без persistent disk;
- сложный concurrent workload;
- external BI;
- PITR/HA requirements.

## Что уже подготовлено

- repositories изолированы ports;
- domain не знает SQL;
- IDs создаёт приложение;
- UTC timestamps;
- migrations отдельно;
- JSON structures локализованы;
- transaction runner abstracted.

## Последовательность

1. Добавить `pg`/`postgres.js`.
2. Создать PostgreSQL migrations.
3. Реализовать `Postgres*Repository`.
4. Реализовать pooled transaction runner.
5. Запустить contract integration tests для обоих adapters.
6. Экспортировать scenarios/world → missions → runtime/evidence.
7. Сверить counts и balance ledger.
8. Переключить reads.
9. Переключить writes.
10. Удалить SQLite только после verification period.

## Типы

```text
TEXT time       → TIMESTAMPTZ
REAL money      → NUMERIC(14,2)
JSON TEXT       → JSONB
0/1             → BOOLEAN
```

## Locks/idempotency

- unique idempotency key остаётся;
- command transaction использует row lock mission/order/rover;
- simulations queue — `FOR UPDATE SKIP LOCKED`;
- optional advisory locks for scenario activation.

## Analytics

Views из `0003_analytics_views.sql` перенести в PostgreSQL dialect; при росте можно сделать materialized views.
