# Каталог ошибок

| Code | HTTP | Значение | UI |
|---|---:|---|---|
| `NOT_FOUND` | 404 | Entity отсутствует | reload/reset |
| `CONFLICT` | 409 | Неверное текущее состояние | показать status |
| `VALIDATION_ERROR` | 400 | Невалидный input | field/error message |
| `DISPATCH_IMPOSSIBLE` | 422 | Domain blocker | blocker list |
| `AI_NOT_CONFIGURED` | internal | Нет key | deterministic mode |
| `AI_TIMEOUT` | internal | Timeout | Luna attempt |
| `AI_TRANSPORT_ERROR` | internal | Network | Luna attempt |
| `INVALID_PROVIDER_RESPONSE` | internal | Non-JSON/empty | Luna attempt |
| `AI_OUTPUT_ERROR` | internal | Tool/schema/domain rejection | Luna attempt |
| `AI_BUDGET_EXCEEDED` | internal | Daily cap | deterministic mode |
| `INTERNAL_ERROR` | 500 | Unexpected | generic + server log |

Ошибки AI не должны повреждать mission state. Ошибка launch должна rollback transaction.
