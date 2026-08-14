# Аналитика и симуляция

## 1. Evidence-first принцип

AI не создаёт KPI. Сначала код строит metrics, затем модель при необходимости объясняет.

## 2. KPI

- current credits;
- net change from start;
- delivered orders;
- completion rate;
- failed deliveries;
- blocked orders;
- average rover utilization.

## 3. Economy timeline

Строится из ordered `economy_entries`, поэтому любое изменение можно связать с ledger row.

## 4. Failure breakdown

Группирует:

- cargo damage;
- battery depletion;
- deadline;
- capacity blocked;
- unavailable resource;
- other.

## 5. Rover utilization

Для MVP utilization оценивается как доля planned delivery minutes в elapsed mission time. Это не полноценная concurrent scheduler metric и явно указано в limitations.

## 6. Monte Carlo

`runMonteCarlo`:

- принимает scenario, policy, iterations, seed;
- создаёт независимый state на sample;
- выбирает candidates одной policy;
- auto-repair/auto-charge при необходимости;
- разрешает deliveries seeded engine;
- возвращает samples + summary.

## 7. Counterfactuals

### Baseline

Текущий сценарий.

### Extra heavy rover

Добавляется ровер с высокой capacity. Это проверяет гипотезу о bottleneck грузоподъёмности.

### Faster charging

`chargerMinutesPerPercent` и `fieldChargeMinutesPerPercent` уменьшаются на 30%.

## 8. Fair comparison

- одинаковая policy;
- одинаковое число iterations;
- общий base seed;
- одинаковая логика outcome;
- меняется только intervention.

## 9. Persistence

Долгий benchmark можно сохранять в:

- `simulation_runs`;
- `simulation_samples`.

UI quick comparison может выполнять небольшой синхронный run. Production path — background job.

## 10. Пример корректного AI-вывода

> Дополнительный тяжёлый ровер повышает simulated success с 61% до 87%. Ускорение зарядки даёт 69%, поэтому текущее узкое место — грузоподъёмность, а не энергия.

Числа должны быть в tool result или analytics DTO. Модель не имеет права добавлять новые проценты.
