# Validation report

Дата актуальной проверки: **2026-08-16**.

Документ фиксирует только фактически выполненные проверки рабочего репозитория. Наличие файла или команды не считается доказательством готовности без успешного запуска.

## 1. Состав проекта

Проверено в рабочем дереве:

- 256 TypeScript/TSX-файлов в `src`;
- 37 файлов в `src/test`, из них 33 `*.test.ts` / `*.spec.ts`;
- 29 Vitest-файлов и 4 Playwright spec-файла;
- 45 Markdown-документов, включая evidence report и автоматически поддерживаемые Next.js agent rules;
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
Structure validation passed: 256 source files, no unresolved local imports.
SQL validation passed: 3 migrations, 18 tables.
Domain validation: PASS.
Syntax validation passed for 272 TypeScript/TSX files.
Documentation links: PASS, 45 Markdown files / 57 local links.
Static assets: PASS, 6 HTML files / 53 local references / 4 JS files.
Secret scan: PASS, 303 text/config files, no credential patterns.
TypeScript: PASS.
ESLint: PASS, 0 warnings.
Vitest: 29 files passed, 44 tests passed.
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

Выполнено в Chromium локально и повторно против публичного VPS `http://38.45.65.229`:

```text
8 passed
```

Проверены:

- health payload и model IDs;
- полный Mission Control surface;
- `HAB-021` нельзя отправить из-за веса 148 кг при максимуме флота 120 кг;
- допустимая доставка запускается и показывает сохранённый результат;
- Scenario Architect и Analytics доступны;
- интерфейс по умолчанию русский;
- переключение `RU → EN → reload → RU` меняет интерфейс и сохраняет выбор.
- на всех пяти страницах приложения отсутствуют известные англоязычные UI-надписи в русском режиме;
- динамические статусы, ошибки, единицы измерения, названия заказов и сценарные подсказки локализованы;
- английскими оставлены только собственные имена точек карты, роверов, моделей и технологических продуктов.

## 8. Визуальная проверка

`npm run screenshots` создал:

```text
screenshots/mission-control.png
screenshots/scenario-architect.png
screenshots/mission-debrief.png
screenshots/ops.png
```

Проверены layout 1440×900, полная русская локализация, навигация, карта, карточки, аналитика и эксплуатационная панель. Маркеры нескольких роверов/заказов на одном узле разнесены, чтобы не накладываться друг на друга.

## 9. Docker / VPS path

Выполнена чистая Linux-сборка:

```bash
docker build --tag moon-courier:verify .
```

Результат актуального VPS-развёртывания: образ `sha256:6439f9bdef2ad98ed372ae1660d8b22e0d068dec6f149c5acfba7288629a7df8`, около 138 MB. Зависимости установлены воспроизводимо через `npm ci` из lock-файла; npm audit сообщил 0 vulnerabilities.

Контейнер запущен как непривилегированный `appuser`; внутри автоматически применены migration и seed SQLite. Контейнер имеет статус `healthy`, публичный HTTP возвращает 200. Против VPS успешно повторены smoke и все 8 E2E; после теста демонстрационная миссия сброшена и создана свежая резервная копия.

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

На VPS авторизация ключа OpenRouter и доступность обоих настроенных model ID подтверждены через API провайдера. Платные запросы с данными миссии не выполнялись без отдельного согласия на их передачу стороннему сервису.

## 11. Secret scan

Реальные credential patterns не найдены. `.env` и SQLite-файлы исключены из Git/Docker context. Значения пользовательских секретов не выводились и не сохранялись в отчёт; проверка OpenRouter выполнялась только по HTTP-статусу авторизации и списку доступных моделей.

## 12. Итог

Offline baseline готов к сдаче и развёртыванию из исходного кода:

```text
validate        PASS
build           PASS
smoke           PASS local + VPS
E2E             PASS local + VPS
screenshots     PASS
Docker build    PASS
```

Платная оценка качества AI-ответов остаётся отдельной проверкой, требующей явного согласия на передачу данных миссии в OpenRouter.
