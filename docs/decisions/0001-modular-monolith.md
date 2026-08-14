# ADR-0001: Modular monolith

- Status: Accepted
- Date: 2026-08-14

## Context

Нужно за три дня показать интерфейс, доменную логику, хранение, AI и тесты, не создавая сложный deployment.

## Decision

Использовать один Next.js/Node deployment unit, но разделить domain, application, infrastructure, AI и UI контрактами.

## Consequences

Проверяющий запускает один проект. Позднее AI и persistence adapters можно вынести без переписывания домена. Цена решения — отсутствие независимого масштабирования web и command workers в MVP.
