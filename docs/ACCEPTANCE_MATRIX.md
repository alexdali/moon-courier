# Матрица соответствия тестовому заданию

| Требование | Реализация | Код/экран | Доказательство |
|---|---|---|---|
| Карта Луны | SVG tactical graph | `lunar-map.tsx` | `/` |
| Точки заказов | destination nodes/order markers | map + order list | select order |
| Вес | domain order field | `load.ts`, `energy.ts`, `speed.ts` | unit/property tests |
| Награда | order + ledger | `economy.ts`, `delivery-resolver.ts` | result/analytics |
| Срочность | urgency scoring + badge | planning/UI | recommendation |
| Риск | segment/zone risk + seeded outcome | `risk.ts`, resolver | warning/failure |
| Батарея | planned consumption + reserve blocker | `energy.ts`, `feasibility.ts` | low-battery test |
| Грузоподъёмность | hard blocker | `load.ts`, `feasibility.ts` | HAB-021 |
| Скорость | ETA and route objective | `speed.ts`, planner | preview |
| Статус ровера | availability/charge/damage | entities/state/use cases | UI cards |
| Выбор пары | Zustand selection | order/rover cards | `/` |
| Запуск | authoritative API command | `launch-delivery.ts` | delivery replay |
| Хранение роверов | SQLite | `rovers` | `db:inspect` |
| Хранение заказов | SQLite | `orders` | `db:inspect` |
| Хранение доставок | SQLite | `deliveries`, segments | Ops/DB |
| Хранение событий | append-only timeline | `events` | event panel |
| Тяжёлый груз влияет | capacity, speed, energy, risk | domain rules | property tests |
| Не хватает батареи → нельзя | reserve check | feasibility | test/UI |
| Разные зоны | speed/risk/energy multipliers | world graph | map/route |
| Невозможная доставка | HAB-021 148 > 120 | fixture + validator | E2E |
| После доставки меняются деньги | ledger/mission update | resolver | result/analytics |
| После доставки меняется батарея | rover update | resolver | card/result |
| После доставки меняется заказ | delivered/failed | resolver | list |
| Цель игры | target/duration/bankruptcy | mission goal | toolbar/result |
| AI используется в продукте | tools + scenario generation | Mission Control/Scenario | audit |
| AI проверяется | schema/domain/balance/tool gates | AI modules | tests/Ops |
| Fallback | DeepSeek → Luna | `model-router.ts` | forced test/audit |
| Как запустить | README/Docker | root docs | clean run |
| Что сделано | README/plan | docs | review |
| Как устроена логика | formulas/rules | docs + code | tests |
| Где данные | data model/migrations | docs/DB | inspect |
| Что использовали из AI | exact models/prompts/audit | README/Ops | ai_runs |

## Дополнительные плюсы

- scenario generation;
- Monte Carlo balancing;
- counterfactual analytics;
- charging/repair;
- idempotency;
- snapshots;
- explicit AI cost audit;
- deterministic mode without API key;
- HTML mockup gallery.
