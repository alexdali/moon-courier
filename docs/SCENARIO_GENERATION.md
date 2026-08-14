# AI Scenario Architect

## 1. Цель

Генерировать не художественное описание, а исполняемый `ScenarioBlueprint`, который можно скомпилировать, проверить, симулировать и сохранить.

## 2. Blueprint

Содержит:

- title/description;
- seed;
- difficulty;
- duration;
- economy/rules;
- sites;
- zones;
- links;
- rovers;
- orders.

В blueprint references используют короткие codes. Compiler создаёт стабильные IDs и полноценные domain entities.

## 3. Generation path

```text
brief
→ DeepSeek strict JSON
→ Zod
→ compiler
→ domain validation
→ 80-run balance
→ save version
```

При rejection:

```text
same brief
→ Luna strict JSON
→ same checks
```

Если обе модели не прошли, deterministic generator создаёт безопасный стартовый вариант и честно помечает source `deterministic`.

## 4. Validation report

Каждая проверка имеет:

- code;
- pass/fail;
- message;
- optional details.

UI показывает:

- schema/domain status;
- connected map;
- feasible pair count;
- impossible orders;
- balance success rate;
- seed.

## 5. Balance criteria

- `survivable`: success rate > 0;
- `too_hard`: < 20%;
- `balanced`: 20–90%;
- `too_easy`: > 90%.

Для MVP слишком лёгкий сценарий можно сохранить, но UI должен показать quality. Несурвайвабельный AI-сценарий отклоняется.

## 6. Seed

Пользователь может задать seed. Если он задан, приложение переопределяет model seed, чтобы повторная генерация/симуляция была контролируемой.

## 7. Activation

Generated scenario сохраняется как template. Отдельная command создаёт новую mission instance, роверы, orders, initial ledger и snapshot.
