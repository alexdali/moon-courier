# Формулы и расчёты

Все округления выполняются после расчёта, а не на каждом промежуточном умножении, кроме явно сохранённых segment metrics.

## 1. Нагрузка

```text
loadRatio = weightKg / capacityKg
capacityUtilization% = clamp(loadRatio × 100, 0, 999)
capacityDeficit = max(0, weightKg - capacityKg)
```

## 2. Скорость

```text
loadPenalty = 1 - 0.18 × clamp(loadRatio, 0, 1.5)
effectiveSpeed = max(
  1,
  baseSpeed × edgeSpeedFactor × zoneSpeedMultiplier × loadPenalty
)
travelMinutes = distance / effectiveSpeed × 60
```

## 3. Энергия

```text
loadMultiplier = 1 + 0.65 × clamp(loadRatio, 0, 2)
segmentEnergyKwh =
  distance × baseEnergyPerKm × edgeEnergyFactor × zoneEnergyMultiplier × loadMultiplier
batteryRequired% = energyKwh / batteryCapacityKwh × 100
```

Для empty approach `loadRatio = 0`. Для loaded leg используется вес заказа.

## 4. Риск

```text
loadMultiplier = 1 + 0.25 × clamp(loadRatio, 0, 2)
resistanceMultiplier = 1 - 0.45 × clamp(riskResistance, 0, 1)
segmentIncidentRisk = clamp(
  baseRisk × zoneRiskMultiplier × loadMultiplier × resistanceMultiplier,
  0,
  0.95
)
segmentFailureRisk = clamp(segmentIncidentRisk × 0.35, 0, 0.8)
routeRisk = 1 - product(1 - eachSegmentRisk)
```

## 5. Preview economy

```text
energyCost = plannedEnergy × energyPrice
expectedRiskLoss = failureRisk × failurePenalty
lateMinutes = max(0, arrivalMinute - deadline)
latePenalty = lateMinutes × latePenaltyPerMinute
expectedNet = reward - energyCost - expectedRiskLoss - latePenalty
```

Preview — математическое ожидание, а не обещание результата.

## 6. Actual economy

Успех:

```text
actualNet = reward - actualEnergyCost - latePenalty
```

Провал:

```text
actualNet = -actualEnergyCost - latePenalty - failurePenalty
```

Ремонт — отдельная последующая операция.

## 7. Charge

```text
addedPercent = targetPercent - currentPercent
addedKwh = batteryCapacity × addedPercent / 100
duration = addedPercent × chargerMinutesPerPercent
cost = addedKwh × chargingCostPerKwh
```

В поле используется `fieldChargeMinutesPerPercent`.

## 8. Candidate score

Score объединяет:

- urgency;
- feasibility;
- expected net;
- success probability;
- duration;
- battery reserve;
- пользовательскую objective/policy.

Impossible candidate получает `-Infinity` и никогда не рекомендуется.

## 9. Monte Carlo

Для каждого sample:

- создаётся чистая миссия;
- применяется одна policy;
- delivery seeds выводятся из sample seed;
- сохраняется final credits и outcome counts.

Summary:

```text
successRate
bankruptcyRate
mean / median / p10 / p90 credits
mean completion rate
mean failed deliveries
```
