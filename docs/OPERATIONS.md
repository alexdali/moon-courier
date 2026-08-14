# Operations

## 1. Startup

```text
load/validate env
→ open SQLite
→ PRAGMA foreign_keys/busy_timeout/WAL
→ apply migrations
→ create repositories
→ initialize demo if absent
→ serve UI/API
```

## 2. Shutdown

Next.js process should stop accepting traffic, finish in-flight transaction and close SQLite on process termination. For the current MVP global connection is left to process shutdown; production hardening can add explicit signal hooks.

## 3. Database commands

```bash
npm run db:migrate
npm run db:seed
npm run db:inspect
npm run db:reset
npm run game:reset
```

`db:reset` requires explicit `--yes` in the underlying script.

## 4. Health

`GET /api/health` checks:

- SQLite query;
- application version;
- configured primary/fallback model IDs;
- whether online AI is enabled;
- local model implementation flag.

## 5. Backup

Recommended schedule for a public demo:

- backup before every deployment;
- hourly copy while active;
- daily retention 7 days.

Safe method:

1. use SQLite backup API or `VACUUM INTO`;
2. checksum backup;
3. run `PRAGMA integrity_check` on restored copy;
4. store outside application volume.

## 6. Recovery

1. stop application;
2. preserve broken DB;
3. restore latest verified backup;
4. run migrations;
5. run `db:inspect`;
6. start application;
7. run smoke.

## 7. AI incident behavior

- provider error: DeepSeek attempt audited, Luna attempted;
- both fail: deterministic assistant/generator;
- budget exceeded: no online call;
- invalid output: `rejected`, never applied to domain state;
- model list mismatch: `verify:models` fails before demo.

## 8. Simulation load

Quick UI simulation is capped. Large runs should be CLI/background:

```bash
npm run simulate -- --iterations=5000
```

Do not run 20k samples synchronously inside a public HTTP request.

## 9. Database growth

Largest tables:

- events;
- snapshots;
- simulation_samples;
- ai responses.

MVP retention is unlimited. Production should define:

- snapshot compaction;
- sample aggregation/expiry;
- AI raw response retention;
- event archival.

## 10. Release check

```bash
npm ci
npm run validate:structure
npm run validate:sql
npm run check
npm run build
npm run smoke
npm run verify:models
```
