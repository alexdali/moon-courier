# Будущий локальный AI-вариант

## Статус

```text
Реализован: нет
Упомянут в README: да
Влияет на текущий scope: нет
```

Текущий MVP использует DeepSeek через OpenRouter и Luna fallback. При отсутствии ключа включается deterministic helper, а не локальная LLM.

## Почему отложено

- ограниченный срок;
- CPU latency может ухудшить демонстрацию;
- потребуются веса, runtime, инструкции для разных ОС;
- tool calling/structured output у малой модели требует отдельной оценки;
- online AI стоит мало на масштабе тестового.

## Будущая архитектура

Добавить provider contract:

```ts
interface LanguageModelProvider {
  complete(request: ModelRequest): Promise<ModelCompletion>;
  healthCheck(): Promise<ModelHealth>;
}
```

Adapters:

```text
OpenRouterProvider
OllamaProvider
LlamaCppProvider
```

`ModelRouter` может получать список providers/models, но domain и tools не меняются.

## Возможная модель

Класс Qwen 8B Q4 для 16 GB RAM; 4B для 8 GB с ограниченным tool scope. Конкретный model ID должен выбираться после актуального benchmark.

## Обязательные проверки

- JSON/tool pass rate;
- Russian understanding;
- p50/p95 latency CPU;
- RAM peak;
- max context;
- scenario schema pass;
- fallback behavior;
- license.

## Не делать

- не скачивать model weights при `npm install`;
- не включать локальную модель обязательной для запуска;
- не позволять локальной модели обходить deterministic tools;
- не заявлять parity с online models без benchmark.
