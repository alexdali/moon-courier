# ADR-0003: SQLite for the test task

- Status: Accepted
- Date: 2026-08-14

## Context

Задание требует структурированное хранение роверов, заказов, доставок и событий. Время ограничено.

## Decision

Использовать SQLite, ordered SQL migrations, WAL, foreign keys, repositories и транзакции.

## Consequences

Проект запускается без внешнего сервера и сохраняет полноценный audit trail. Несколько параллельных application replicas не поддерживаются; путь перехода описан в `POSTGRES_MIGRATION.md`.
