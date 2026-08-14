# Validation report

Дата актуальной проверки: **2026-08-15**.

Документ фиксирует только фактически выполненные проверки рабочего репозитория. Наличие файла или команды не считается доказательством готовности без успешного запуска.

## 1. Состав проекта

Проверено в рабочем дереве:

- 254 TypeScript/TSX-файла в `src`;
- 35 файлов в `src/test`, из них 31 `*.test.ts` / `*.spec.ts`;
- 28 Vitest-файлов и 3 Playwright spec-файла;
- 44 Markdown-документа, включая evidence report и автоматически поддерживаемые Next.js agent rules;
- 3 SQL migration;
- 4 актуальных скриншота интерфейса;
- Dockerfile, Docker Compose и GitHub Actions CI.

## 2. Полный local quality gate

Выполнено:

```bash
npm ci
npm run validate
```

Результат:

```text
Structure validation passed: 254 source files, no unresolved local imports.
SQL validation passed: 3 migrations, 18 tables.
Domain validation: PASS.
Syntax validation passed for 270 TypeScript/TSX files.
Documentation links: PASS, 44 Markdown files / 57 local links.
Static assets: PASS, 6 HTML files / 53 local references / 4 JS files.
Secret scan: PASS, 301 text/config files, no credential patterns.
TypeScript: PASS.
ESLint: PASS, 0 warnings.
Vitest: 28 files passed, 37 tests passed.
```

## 3. Доменный сценарий

`npm run validate:domain` подтвердил:

```json
{
  "scenario": "Shackleton Medical Surge",
  "validation": "PASS",
  "feasiblePairs": 6,
  "impossibleOrders": ["HAB-021"],
  "plannerCandidates": 18,
  "dispatchableCandidates": 6,
  "recommended": {
    "order": "MED-017",
    "rover": "ATLAS-1"
  }
}
```

Также пройдены инварианты грузоподъёмности, батареи, влияния веса на скорость/энергию, влияния устойчивости на риск, воспроизводимого seeded replay и изменения состояния/ledger после доставки.

## 4. Persistence

Проверено на чистой SQLite базе и integration-тестами:

- применение трёх migration;
- 18 таблиц и отсутствие нарушений внешних ключей;
- seed: 1 миссия, 6 заказов, 3 ровера, 6 узлов карты;
- транзакционный rollback;
- idempotency запуска доставки;
- сохранение доставки, сегментов, событий, экономики и snapshot;
- зарядка и ремонт ровера;
- стабильный хронологический порядок ledger-записей даже при одинаковом timestamp.

## 5. Production build

Выполнено:

```bash
npm run build
```

Результат: **PASS**. Next.js 16 production build завершён без предупреждений; все страницы и 14 API routes собраны как динамические server-rendered routes.

## 6. HTTP smoke

На запущенном production server и повторно внутри Docker выполнено:

```text
PASS /api/health 200
PASS / 200
PASS /scenario 200
PASS /analytics 200
```

Health endpoint подтвердил доступность SQLite и конфигурацию AI-маршрутов.

## 7. End-to-end

Выполнено в Chromium локально и повторно против Docker container:

```text
5 passed
```

Проверены:

- health payload и model IDs;
- полный Mission Control surface;
- `HAB-021` нельзя отправить из-за веса 148 кг при максимуме флота 120 кг;
- допустимая доставка запускается и показывает сохранённый результат;
- Scenario Architect и Analytics доступны;
- интерфейс по умолчанию русский;
- переключение `RU → EN → reload → RU` меняет интерфейс и сохраняет выбор.

## 8. Визуальная проверка

`npm run screenshots` создал:

```text
screenshots/mission-control.png
screenshots/scenario-architect.png
screenshots/mission-debrief.png
screenshots/ops.png
```

Проверены layout 1440×900, русская локализация, навигация, карта, карточки, аналитика и Ops. Маркеры нескольких роверов/заказов на одном узле разнесены, чтобы не накладываться друг на друга.

## 9. Docker / VPS path

Выполнена чистая Linux-сборка:

```bash
docker build --tag moon-courier:verify .
```

Результат: образ `sha256:4b2fc5f56ce51a4cc62a0f75c73a414c8153d824c61b593e538378eb300aa4ce`, около 375 MB. Зависимости установлены воспроизводимо через `npm ci` из lock-файла; npm audit сообщил 0 vulnerabilities.

Контейнер запущен как непривилегированный `appuser`; внутри автоматически применены migration и seed SQLite. Против контейнера успешно повторены smoke и все 5 E2E. Одноразовый проверочный контейнер после теста остановлен.

## 10. AI routing

Статически и unit-тестами подтверждено:

- primary: `deepseek/deepseek-v4-flash-0731`;
- fallback: `openai/gpt-5.6-luna`;
- application-level fallback после provider/timeout/JSON/schema/domain/tool failure;
- одинаковые deterministic gates для обеих моделей;
- whitelist tools;
- audit tokens, cost, latency, model role и tool calls;
- deterministic degraded mode без API key;
- ответ Mission Control на языке пользовательского запроса.

Live-вызовы OpenRouter не выполнялись: секретного ключа в репозитории нет. Команды `verify:models` и `evaluate:ai` остаются owner-controlled платной проверкой.

## 11. Secret scan

Реальные credential patterns не найдены. `.env` и SQLite-файлы исключены из Git/Docker context. Значения пользовательских секретов не читались и не сохранялись в отчёт.

## 12. Итог

Offline baseline готов к сдаче и развёртыванию из исходного кода:

```text
validate        PASS
build           PASS
smoke           PASS local + Docker
E2E             PASS local + Docker
screenshots     PASS
Docker build    PASS
```

Единственная отдельная внешняя проверка — доступность и стоимость выбранных OpenRouter model IDs с пользовательским API key.
