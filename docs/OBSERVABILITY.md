# Observability

## 1. Structured logs

Pino log entries should carry context:

```json
{
  "service": "moon-courier",
  "requestId": "...",
  "missionId": "...",
  "deliveryId": "...",
  "aiRunId": "...",
  "model": "...",
  "latencyMs": 120,
  "errorCode": "..."
}
```

Secrets must be redacted.

## 2. Persistent operational evidence

Logs are not the only evidence. Database records survive restart:

- delivery replay;
- event timeline;
- ledger;
- snapshots;
- scenario validation;
- simulation summary/samples;
- AI runs/tool calls.

## 3. Ops screen

`/ops` shows:

- table counts;
- current mission;
- recent AI attempts;
- model role;
- status;
- tokens/cost/latency;
- recent simulations.

## 4. Evidence report

```bash
npm run report
```

Creates `reports/demo-evidence.md` from database state. It should include:

- requirements proof;
- counts;
- impossible order;
- recent deliveries;
- event count;
- AI attempts;
- simulation balance.

## 5. Recommended production metrics

- HTTP request rate/error/latency;
- SQLite busy/transaction duration;
- dispatch preview p95;
- delivery transaction p95;
- AI success/rejection/fallback rate;
- AI token/cost per request;
- simulation queue duration;
- DB file size;
- event/snapshot growth;
- scenario validation failure codes.

## 6. Tracing upgrade

Later add OpenTelemetry spans:

```text
http.request
usecase.launch_delivery
route.plan
simulation.resolve
sqlite.transaction
ai.primary
ai.fallback
ai.tool
```
