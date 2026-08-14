# AI pipeline: DeepSeek primary → Luna fallback

## 1. Конфигурация

```dotenv
AI_PRIMARY_MODEL=deepseek/deepseek-v4-flash-0731
AI_FALLBACK_MODEL=openai/gpt-5.6-luna
AI_MAX_TOOL_TURNS=4
AI_MAX_OUTPUT_TOKENS=1400
AI_REASONING_ENABLED=false
AI_PROVIDER_REQUIRE_PARAMETERS=true
AI_DATA_COLLECTION=deny
```

Model IDs вынесены в environment, потому что доступность и цена меняются.

## 2. Почему OpenRouter

- единый transport для двух моделей;
- одинаковая OpenAI-compatible форма tool calls;
- structured outputs;
- usage/cost metadata;
- provider parameter filtering;
- простое переключение model slug.

Fallback выполняется приложением, а не скрытым routing list.

## 3. ModelRouter

`ModelRouter.execute` проходит список:

```text
[primary DeepSeek, fallback Luna]
```

Для каждой попытки:

1. создать `ai_runs` row со status `started`;
2. выполнить конкретный agent/generator contract;
3. вычислить cost из provider usage или configured estimate;
4. сохранить `succeeded`;
5. при ошибке сохранить `failed` или `rejected`;
6. перейти к следующей модели;
7. после двух ошибок бросить AggregateError.

`rejected` означает: модель ответила, но результат не прошёл parser/schema/domain/tool gate.

## 4. Mission Control tool calling

System prompt запрещает модели самостоятельно вычислять operational metrics.

Контекст сокращён до:

- mission summary;
- rovers;
- pending orders;
- selected pair;
- tool definitions.

Loop:

```text
completion
→ zero or more tool calls
→ parse arguments
→ execute whitelist tool
→ persist tool audit
→ append tool result
→ next completion
→ final explanation
```

Operational question без tool call отклоняется.

## 5. Scenario structured output

Запрос включает:

```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "moon_courier_scenario",
      "strict": true,
      "schema": {}
    }
  }
}
```

После provider-level structured output всё равно выполняется Zod parse, потому что endpoint guarantees могут различаться.

## 6. Validation gates

### Mission Control

- tool name whitelist;
- JSON parse;
- tool-specific schema;
- tool execution;
- tool required for operational request;
- turn limit;
- non-empty final answer.

### Scenario Architect

- JSON parse;
- Zod schema;
- unique identifiers;
- valid references;
- connected graph;
- numeric ranges;
- feasible assignment;
- mandatory impossible order;
- target upper bound;
- Monte Carlo survivability.

## 7. Audit data

`ai_runs`:

```text
request_type
provider
model
model_role
prompt_version
status
input_tokens
output_tokens
cost_usd
latency_ms
request_json
response_json
error_code
error_message
```

`ai_tool_calls`:

```text
tool_call_id
name
arguments_json
result_json
duration_ms
status
error_message
```

## 8. Budget

`AiBudgetGuard` суммирует стоимость всех succeeded/rejected/failed attempts за текущие UTC сутки. При превышении лимита online AI не вызывается, а продукт переходит в deterministic mode.

## 9. Failure matrix

| Сбой | DeepSeek | Luna | Итог |
|---|---|---|---|
| timeout | failed | attempted | Luna или deterministic |
| 429/5xx | failed | attempted | Luna или deterministic |
| invalid JSON | rejected | attempted | Luna или deterministic |
| wrong schema | rejected | attempted | Luna или deterministic |
| unknown tool | rejected | attempted | Luna или deterministic |
| no tool for operational request | rejected | attempted | Luna или deterministic |
| invalid scenario | rejected | attempted | Luna или deterministic |
| both fail | failed/rejected | failed/rejected | game remains functional |

## 10. Prompt versioning

Каждый prompt module экспортирует version constant. Любое содержательное изменение prompt должно менять version, чтобы benchmark и audit не смешивали разные конфигурации.

## 11. Local model

Текущий pipeline не содержит Ollama/llama.cpp client. Будущий adapter должен реализовать тот же `AiService`/provider contract. Подробно: [`LOCAL_MODEL_FUTURE.md`](LOCAL_MODEL_FUTURE.md).
