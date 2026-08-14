# Ограничения MVP

## Product

- Один игрок, одна активная миссия.
- Нет аккаунтов, прогресса между пользователями и leaderboard.
- Нет одновременной временной модели нескольких доставок.
- Один заказ не делится между роверами.
- Нет покупки/апгрейда флота в runtime.
- Карта — абстрактный граф, а не физически точная поверхность Луны.

## Simulation

- Риск независим между сегментами.
- Repair/charge policy упрощена.
- Utilization — approximation.
- Monte Carlo policy не является глобально оптимальной.
- Нет integer/constraint solver для multi-order schedule.

## AI

- Ответы вероятностные.
- Structured output support зависит от endpoint.
- Доступность/цена model IDs меняется.
- Нет semantic verifier для prose explanation.
- Нет local model runtime.
- Deterministic degraded assistant ограничен фиксированными intents.

## Data

- SQLite single-writer.
- Нет built-in encryption at rest.
- Нет retention/archival.
- Snapshot JSON может расти.
- Нет production backup scheduler.

## Security

- In-memory rate limit не распределён.
- Нет auth/CAPTCHA.
- `ADMIN_TOKEN` — placeholder для дальнейшего усиления.
- Synthetic demo data only.

## Deployment

- Один process/replica.
- Не оптимизировано для serverless ephemeral filesystem.
- Long simulations не вынесены в queue.

Эти ограничения сознательны: они удерживают тестовое в объёме, который можно закончить и проверить за три дня.
