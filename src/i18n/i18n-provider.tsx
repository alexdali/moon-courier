'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'ru' | 'en';

const STORAGE_KEY = 'moon-courier-locale';

const ru: Record<string, string> = {
  'MOON COURIER': 'ЛУННЫЙ КУРЬЕР',
  'Moon Courier Crisis': 'Лунный курьер: кризис',
  'Lunar Mission Control': 'Лунный центр управления',
  'Mission': 'Миссия',
  'Scenario Architect': 'Конструктор сценариев',
  'Debrief': 'Разбор миссии',
  'Ops': 'Система',
  'Mockups': 'Макеты',
  'Primary navigation': 'Основная навигация',
  'Russian': 'Русский',
  'English': 'Английский',
  'Language': 'Язык',
  'Interface version': 'Версия интерфейса',
  'Simple': 'Простая',
  'Detailed': 'Подробная',
  'Color theme': 'Цветовая тема',
  'Light': 'Светлая',
  'Dark': 'Тёмная',
  'More details': 'Подробнее',
  'Destination': 'Назначение',
  'Urgency': 'Срочность',
  'Deadline': 'Срок',
  'No deadline': 'Без срока',
  'Speed': 'Скорость',
  'Does not fit this order': 'Не подходит для этого заказа',
  'MISSION MAP': 'КАРТА МИССИИ',
  'Show map details': 'Показать детали карты',
  'Hide map details': 'Скрыть детали карты',
  'Route settings': 'Настройки маршрута',
  'Full calculation': 'Полный расчёт',
  'Mission events': 'События миссии',
  'AI assistant': 'ИИ-помощник',
  'scenario': 'сценарий',
  'scenario.easy': 'лёгкий сценарий',
  'scenario.normal': 'обычный сценарий',
  'scenario.hard': 'сложный сценарий',
  'scenario.crisis': 'кризисный сценарий',
  'easy': 'лёгкая',
  'hard': 'сложная',
  'crisis': 'кризисная',
  'completed': 'завершена',
  'won': 'победа',
  'lost': 'поражение',
  'DAY': 'ДЕНЬ',
  'target': 'цель',
  'Mission debrief': 'Разбор миссии',
  'Reset demo': 'Сбросить демо',
  'Queue': 'Очередь',
  'Orders': 'Заказы',
  'active': 'активно',
  'all': 'все',
  'critical': 'критические',
  'feasible': 'доступные',
  'blocked': 'заблокированные',
  'Impossible': 'Невозможно',
  'pending': 'ожидает',
  'assigned': 'назначен',
  'in transit': 'в пути',
  'in_transit': 'в пути',
  'delivered': 'доставлен',
  'failed': 'провален',
  'cancelled': 'отменён',
  'low': 'низкая',
  'normal': 'обычная',
  'high': 'высокая',
  'Fleet': 'Флот',
  'available': 'доступен',
  'available count': 'доступно',
  'en route': 'в пути',
  'en_route': 'в пути',
  'charging': 'заряжается',
  'damaged': 'повреждён',
  'disabled': 'отключён',
  'battery': 'батарея',
  'capacity': 'грузоподъёмность',
  'Capacity deficit': 'Нехватка грузоподъёмности',
  'Repair rover': 'Отремонтировать ровер',
  'Charge to 100%': 'Зарядить до 100%',
  'Dispatch preview': 'Расчёт отправки',
  'deterministic engine': 'детерминированный движок',
  'balanced': 'баланс',
  'fastest': 'быстрее',
  'safest': 'безопаснее',
  'efficient': 'выгоднее',
  'Select an order and a rover to calculate route, battery, risk and economy.': 'Выберите заказ и ровер, чтобы рассчитать маршрут, батарею, риск и экономику.',
  'Calculating…': 'Расчёт…',
  'Ready to dispatch': 'Готово к отправке',
  'High-risk dispatch': 'Отправка с высоким риском',
  'Dispatch impossible': 'Отправка невозможна',
  'ready': 'готово',
  'warning': 'риск',
  'impossible': 'невозможно',
  'Distance': 'Расстояние',
  'ETA': 'Время в пути',
  'Route risk': 'Риск маршрута',
  'Expected net': 'Ожидаемый итог',
  'battery after': 'батареи после',
  'Resolving delivery…': 'Расчёт доставки…',
  'Launch delivery': 'Запустить доставку',
  'Mission Control AI': 'ИИ центра управления',
  'deterministic mode': 'детерминированный режим',
  'Recommend': 'Рекомендовать',
  'Explain': 'Объяснить',
  'Compare': 'Сравнить',
  'Offline rules': 'Офлайн-правила',
  'Analyzing': 'анализ',
  'AI is analyzing…': 'ИИ анализирует…',
  'Models unavailable — showing deterministic calculation.': 'Модели недоступны — показан детерминированный расчёт.',
  'Luna fallback': 'резервная модель Luna',
  'Used': 'Использовано',
  'deterministic tool': 'детерминированный инструмент',
  'deterministic tools': 'детерминированных инструмента',
  'Apply recommendation': 'Применить рекомендацию',
  'Ask for a plan, blocker explanation or counterfactual simulation.': 'Запросите план, объяснение блокировки или сравнение сценариев.',
  'Ask Mission Control…': 'Спросите центр управления…',
  'Event stream': 'Лента событий',
  'persisted': 'сохранено',
  'Launch a delivery to populate the audit timeline.': 'Запустите доставку, чтобы заполнить журнал событий.',
  'DELIVERY COMPLETE': 'ДОСТАВКА ВЫПОЛНЕНА',
  'DELIVERY FAILED': 'ДОСТАВКА НЕ УДАЛАСЬ',
  'reached the destination.': 'достиг точки назначения.',
  'Failure': 'Причина',
  'unknown incident': 'неизвестный инцидент',
  'Net result': 'Финансовый итог',
  'Battery': 'Батарея',
  'Events': 'События',
  'Close': 'Закрыть',
  'TACTICAL MAP': 'ТАКТИЧЕСКАЯ КАРТА',
  'selected route': 'выбранный маршрут',
  'high risk': 'высокий риск',
  'Lunar delivery map': 'Карта лунных доставок',
  'sites': 'точек',
  'routes': 'маршрутов',
  'Seed': 'Сид',
  'kg': 'кг',
  'km': 'км',
  'min': 'мин',
  'km/h': 'км/ч',
  'ms': 'мс',
  'CR': 'кр.',
  'Mission Debrief': 'Разбор миссии',
  'Operational analytics': 'Операционная аналитика',
  'Evidence before explanation.': 'Сначала данные, потом объяснение.',
  'All metrics and counterfactuals are calculated by the deterministic engine. AI may explain these numbers, but it never creates them.': 'Все метрики и альтернативные сценарии рассчитывает детерминированный движок. ИИ может объяснять числа, но не создаёт их.',
  'Total credits': 'Всего кредитов',
  'from start': 'от старта',
  'Completion': 'Выполнение',
  'delivered orders': 'доставлено заказов',
  'Failures': 'Провалы',
  'blocked orders': 'заблокировано заказов',
  'Fleet utilization': 'Загрузка флота',
  'moving time share': 'доля времени в движении',
  'Computed insight': 'Расчётный вывод',
  'Heavy-load capacity is the leading bottleneck.': 'Главное ограничение — доставка тяжёлых грузов.',
  'The best intervention depends on current mission state.': 'Лучшее улучшение зависит от текущего состояния миссии.',
  'Run the counterfactual simulation to compare options.': 'Запустите симуляцию, чтобы сравнить варианты.',
  'Evidence': 'Данные',
  'events': 'событий',
  'deliveries': 'доставок',
  'simulation runs': 'прогонов симуляции',
  'Running 300 simulations…': 'Выполняется 300 симуляций…',
  'Run deeper simulation': 'Запустить подробную симуляцию',
  'Mission analysis sections': 'Разделы разбора миссии',
  'Mission analysis': 'Разбор миссии',
  'Developer mode': 'Режим разработчика',
  'AI log': 'Журнал ИИ',
  'AI requests': 'Запросы к ИИ',
  'All tokens': 'Все токены',
  'Cached tokens': 'Токены из кэша',
  'Cache write tokens': 'Токены записи в кэш',
  'Total cost': 'Общая стоимость',
  'All-time AI cost': 'Стоимость ИИ за всё время',
  'AI cost by day': 'Стоимость ИИ по дням',
  'Daily totals': 'Итоги по дням',
  'Dates are grouped by UTC': 'Дни рассчитаны по UTC',
  'Date': 'Дата',
  'Requests': 'Запросы',
  'Input / output': 'Вход / выход',
  'Refresh history': 'Обновить историю',
  'Provider request history': 'История запросов к провайдеру',
  'OpenRouter request log': 'Журнал запросов OpenRouter',
  'Stored model attempts, exact provider parameters and prompts. API keys are never recorded.': 'Сохранённые обращения к моделям, точные параметры провайдера и промпты. Ключи API никогда не записываются.',
  'records': 'записей',
  'No AI requests have been saved yet.': 'Сохранённых запросов к ИИ пока нет.',
  'Provider': 'Провайдер',
  'Model role': 'Роль модели',
  'Prompt version': 'Версия промпта',
  'Input tokens': 'Входные токены',
  'Output tokens': 'Выходные токены',
  'Provider request': 'Запрос к провайдеру',
  'Prompt': 'Промпт',
  'Request parameters': 'Параметры запроса',
  'Saved legacy request': 'Сохранённый старый запрос',
  'This record predates detailed provider logging. Available input data is shown below.': 'Эта запись создана до появления подробного журнала провайдера. Ниже показаны все доступные входные данные.',
  'Request data': 'Данные запроса',
  'Full data': 'Полные данные',
  'Open Full data on a request to see its prompt, model parameters and token details.': 'Нажмите «Полные данные» у запроса, чтобы увидеть промпт, параметры модели и сведения о токенах.',
  'system': 'система',
  'user': 'пользователь',
  'assistant': 'ассистент',
  'tool': 'инструмент',
  'message': 'сообщение',
  'Economy over time': 'Экономика во времени',
  'Balance trajectory': 'Динамика баланса',
  'Start': 'Старт',
  'Now': 'Сейчас',
  'Operational losses': 'Операционные потери',
  'Failure breakdown': 'Причины провалов',
  'No failed deliveries yet. The intentionally impossible order is still tracked as a blocker.': 'Проваленных доставок пока нет. Заведомо невозможный заказ учитывается как блокировка.',
  'Fleet capacity': 'Возможности флота',
  'Rover utilization': 'Загрузка роверов',
  'moving': 'в движении',
  'idle': 'простой',
  'Counterfactual laboratory': 'Лаборатория сценариев',
  'Strategy comparison': 'Сравнение стратегий',
  'Current fleet': 'Текущий флот',
  '+1 heavy rover': '+1 тяжёлый ровер',
  '+30% charging speed': '+30% к скорости зарядки',
  'Safer route network': 'Более безопасные маршруты',
  '30% safer routes': 'Маршруты на 30% безопаснее',
  'Intentionally impossible order': 'Заведомо невозможный заказ',
  'mission success': 'успех миссии',
  'Median': 'Медиана',
  'Scenario Architect subtitle': 'Конструктор сценариев',
  'AI world generation': 'Генерация мира с помощью ИИ',
  'Generate worlds. Validate every rule.': 'Создавайте миры. Проверяйте каждое правило.',
  'DeepSeek produces a strict scenario blueprint. Code checks the graph, identifiers, feasible assignments, the impossible order and economic survivability. Luna is called only when the primary attempt fails.': 'DeepSeek создаёт строгую схему сценария. Код проверяет граф, идентификаторы, допустимые назначения, невозможный заказ и экономическую устойчивость. Luna вызывается только при сбое основной модели.',
  'Scenario brief': 'Описание сценария',
  'AI structured output': 'структурированный ответ ИИ',
  'JSON Schema': 'Схема JSON',
  'Mission prompt': 'Запрос миссии',
  'Preset': 'Шаблон',
  'Difficulty': 'Сложность',
  'Duration': 'Длительность',
  'days': 'дней',
  'Generating and validating…': 'Генерация и проверка…',
  'Generate scenario': 'Создать сценарий',
  'Domain validation': 'Проверка домена',
  'Balance simulation': 'Симуляция баланса',
  'No generated world yet': 'Сгенерированного мира пока нет',
  'The built-in scenario remains available. Generate a new structured world to inspect its map and validation evidence.': 'Встроенный сценарий остаётся доступен. Создайте новый мир, чтобы изучить его карту и результаты проверок.',
  'Generated by': 'Источник:',
  'deepseek': 'DeepSeek',
  'luna': 'Luna',
  'deterministic': 'детерминированный алгоритм',
  'fixture': 'встроенный сценарий',
  'manual': 'ручной режим',
  'ai': 'ИИ',
  'validated': 'проверен',
  'rejected': 'отклонён',
  'Sites': 'Точки',
  'Rovers': 'Роверы',
  'Orders count': 'Заказы',
  'Balance': 'Баланс',
  'Activate this mission': 'Активировать миссию',
  'Saved scenarios': 'Сохранённые сценарии',
  'versions available': 'версий доступно',
  'Activate': 'Активировать',
  'Mission activated': 'Миссия активирована',
  'Open Mission Control': 'Открыть центр управления',
  'Operations & Evidence': 'Система и доказательства',
  'Audit surface': 'Аудит системы',
  'Data, models, tools and cost are visible.': 'Данные, модели, инструменты и стоимость видимы.',
  'The operations screen proves what is persisted and which model actually handled each AI request.': 'Экран системы показывает, что сохранено и какая модель реально обработала каждый запрос к ИИ.',
  'AI routing': 'Маршрутизация ИИ',
  'Scenarios': 'Сценарии',
  'Missions': 'Миссии',
  'Deliveries': 'Доставки',
  'Ai Runs': 'Запуски ИИ',
  'ai Runs': 'Запуски ИИ',
  'online': 'онлайн',
  'offline': 'офлайн',
  'Primary': 'Основная',
  'Fallback': 'Резервная',
  'Cost today': 'Стоимость сегодня',
  'Fallback is explicit in application code, so every failed DeepSeek attempt and every Luna recovery can be audited separately.': 'Резервный маршрут задан явно в коде: каждый сбой DeepSeek и восстановление через Luna можно проверить отдельно.',
  'Runtime': 'Среда выполнения',
  'Environment': 'Окружение',
  'Database': 'База данных',
  'Recent AI runs': 'Последние запуски ИИ',
  'audit records': 'записей аудита',
  'Request': 'Запрос',
  'Model': 'Модель',
  'Role': 'Роль',
  'Status': 'Статус',
  'Tokens': 'Токены',
  'Latency': 'Задержка',
  'Cost': 'Стоимость',
  'No AI calls have been made. Add an OpenRouter key and use Mission Control or Scenario Architect.': 'Обращений к ИИ ещё не было. Добавьте ключ OpenRouter и используйте центр управления или конструктор сценариев.',
  'Architecture': 'Архитектура',
  'Design principle': 'Принцип проектирования',
  'LLM outside the domain core.': 'Языковая модель вне доменного ядра.',
  'Battery, payload, route, risk, economy and delivery outcome remain deterministic and testable.': 'Батарея, груз, маршрут, риск, экономика и результат доставки остаются детерминированными и тестируемыми.',
  'Runtime flow': 'Поток выполнения',
  'Offline position': 'Офлайн-режим',
  'Prototype boundary': 'Границы прототипа',
  'The current implementation deliberately does not ship a local LLM. The domain engine and deterministic assistant still work without an API key. A future Ollama-compatible adapter can implement the same transport contract without changing the game rules.': 'Текущая версия намеренно не включает локальную языковую модель. Доменный движок и детерминированный помощник работают без ключа API. В будущем совместимый с Ollama адаптер сможет реализовать тот же транспортный контракт без изменения правил игры.',
  'This is a strong test-task vertical slice, not a production fleet-management platform. It demonstrates state modeling, constraints, persistence, seeded simulation, AI tool calling, fallback and evidence.': 'Это полноценный вертикальный срез тестового задания, а не промышленная платформа управления флотом. Он демонстрирует моделирование состояния, ограничения, хранение данных, воспроизводимую симуляцию, вызовы инструментов ИИ, резервный маршрут и проверяемые доказательства.',
  'Generated scenario map': 'Карта сгенерированного сценария',
  'Shackleton Medical Surge': 'Медицинский кризис у Шеклтона',
  'A seven-day relief mission with limited heavy transport and a day-four medical demand spike.\n\nMedical and life-support demand rises sharply while shadow sectors remain risky.': 'Семидневная спасательная миссия с ограниченным числом тяжёлых роверов и всплеском медицинских потребностей на четвёртый день.\n\nПотребность в медикаментах и системах жизнеобеспечения резко растёт, а затенённые секторы остаются опасными.',
  'Medical oxygen': 'Медицинский кислород',
  'Communication module': 'Модуль связи',
  'Biological samples': 'Биологические образцы',
  'Water recycling filters': 'Фильтры переработки воды',
  'Solar inverter': 'Солнечный инвертор',
  'Habitat pressure frame': 'Силовой каркас жилого модуля',
  'Oversized habitat frame': 'Крупногабаритный каркас жилого модуля',
  'Create a seven-day mission with a medical demand spike on day four, limited heavy transport and one intentionally impossible order.': 'Создай семидневную миссию со всплеском медицинских потребностей на четвёртый день, ограниченным тяжёлым транспортом и одним заведомо невыполнимым заказом.',
  'Create a safer training scenario with two chargers and moderate demand.': 'Создай безопасный учебный сценарий с двумя зарядными станциями и умеренным спросом.',
  'Create a crisis mission with volatile demand, shadow zones and a strict survival target.': 'Создай кризисную миссию с нестабильным спросом, затенёнными зонами и строгой целью выживания.',
  'UNIQUE IDENTIFIERS': 'УНИКАЛЬНОСТЬ ИДЕНТИФИКАТОРОВ',
  'MAP CONNECTED': 'СВЯЗНОСТЬ КАРТЫ',
  'REFERENCES VALID': 'КОРРЕКТНОСТЬ ССЫЛОК',
  'HAS FEASIBLE DELIVERY': 'НАЛИЧИЕ ВЫПОЛНИМОЙ ДОСТАВКИ',
  'HAS IMPOSSIBLE ORDER': 'НАЛИЧИЕ НЕВЫПОЛНИМОГО ЗАКАЗА',
  'NUMERIC RANGES': 'ДОПУСТИМЫЕ ЧИСЛОВЫЕ ДИАПАЗОНЫ',
  'RULE RANGES': 'ДОПУСТИМЫЕ ДИАПАЗОНЫ ПРАВИЛ',
  'TARGET GROSS UPPER BOUND': 'ДОСТИЖИМОСТЬ ФИНАНСОВОЙ ЦЕЛИ',
  'All identifiers are unique': 'Все идентификаторы уникальны',
  'Duplicate identifiers found': 'Найдены повторяющиеся идентификаторы',
  'Map graph is connected': 'Граф карты связен',
  'Map contains unreachable nodes': 'На карте есть недоступные точки',
  'All map references resolve': 'Все ссылки карты корректны',
  'One or more references are invalid': 'Одна или несколько ссылок некорректны',
  'No feasible assignment exists': 'Нет ни одного допустимого назначения',
  'Numeric values are within accepted ranges': 'Числовые значения находятся в допустимых диапазонах',
  'Invalid numeric values found': 'Найдены недопустимые числовые значения',
  'Scenario rules are within accepted ranges': 'Правила сценария находятся в допустимых диапазонах',
  'One or more scenario rules are invalid': 'Одно или несколько правил сценария некорректны',
  'No intentionally impossible order found': 'Заведомо невыполнимый заказ не найден',
  'Capacity exceeded': 'Превышена грузоподъёмность',
  'Battery insufficient': 'Недостаточный заряд батареи',
  'Rover unavailable': 'Ровер недоступен',
  'Order unavailable': 'Заказ недоступен',
  'No route': 'Маршрут отсутствует',
  'Battery depleted': 'Батарея разряжена',
  'Deadline missed': 'Срок доставки пропущен',
  'Unknown failure': 'Неизвестная ошибка',
  'BATTERY_DEPLETED': 'БАТАРЕЯ РАЗРЯЖЕНА',
  'CARGO_DAMAGED': 'ГРУЗ ПОВРЕЖДЁН',
  'DEADLINE_MISSED': 'СРОК ДОСТАВКИ ПРОПУЩЕН',
  'UNKNOWN': 'НЕИЗВЕСТНАЯ ОШИБКА',
  'get_mission_summary': 'сводка по миссии',
  'recommend_dispatch': 'рекомендация по доставке',
  'explain_dispatch_blockers': 'объяснение ограничений доставки',
  'compare_fleet_options': 'сравнение вариантов флота',
  'get_delivery_analytics': 'аналитика доставок',
  'mission_control': 'центр управления',
  'scenario_generation': 'генерация сценария',
  'primary': 'основная',
  'fallback': 'резервная',
  'started': 'запущен',
  'succeeded': 'успешно',
  'production': 'рабочая',
  'development': 'разработка',
  'scenarios': 'сценарии',
  'missions': 'миссии',
  'rovers': 'роверы',
  'orders': 'заказы',
  'No connected route exists': 'Связного маршрута не существует',
  'Projected arrival is after the deadline': 'Расчётное прибытие позже срока',
  'Delivery started': 'Доставка начата',
  'Route segment completed': 'Участок маршрута пройден',
  'Terrain delay': 'Задержка из-за рельефа',
  'Unexpected battery drain': 'Неожиданный расход батареи',
  'Cargo damaged': 'Груз повреждён',
  'Delivery failed': 'Доставка не удалась',
  'Delivery completed': 'Доставка выполнена',
  'Mission economy updated': 'Экономика миссии обновлена',
  'Rover repaired': 'Ровер отремонтирован',
  'Rover charged': 'Ровер заряжен',
  'Field solar charge completed': 'Полевая солнечная зарядка завершена',
  'Request validation failed': 'Запрос не прошёл проверку',
  'Unexpected error': 'Непредвиденная ошибка',
  'Dispatch is impossible for the selected order and rover': 'Выбранные заказ и ровер несовместимы',
  'Mission Control failed to initialize': 'Не удалось запустить центр управления',
  'Retry': 'Повторить',
  'Loading Mission Control…': 'Загрузка центра управления…',
  'Sector not found': 'Сектор не найден',
  'The requested Mission Control route does not exist.': 'Запрошенный маршрут центра управления не существует.',
  'Return to mission': 'Вернуться к миссии',
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function translateRussianText(key: string): string {
  const direct = ru[key];
  if (direct) return direct;
  let match = /^Payload ([\d.]+) kg exceeds fleet maximum capacity ([\d.]+) kg$/.exec(key);
  if (match) return `Груз ${match[1]} кг превышает максимальную грузоподъёмность флота ${match[2]} кг`;
  match = /^Payload exceeds capacity by ([\d.]+) kg$/.exec(key);
  if (match) return `Груз превышает грузоподъёмность на ${match[1]} кг`;
  match = /^Battery would fall below ([\d.]+)% reserve$/.exec(key);
  if (match) return `Батарея опустится ниже резерва ${match[1]}%`;
  match = /^High route incident risk: ([\d.]+)%$/.exec(key);
  if (match) return `Высокий риск происшествия на маршруте: ${match[1]}%`;
  match = /^(\d+) feasible assignments found$/.exec(key);
  if (match) return `Найдено допустимых назначений: ${match[1]}`;
  match = /^Balance ([\d.-]+) \/ ([\d.-]+) CR; (\d+) delivered, (\d+) failed, (\d+) pending\.$/.exec(key);
  if (match) return `Баланс ${match[1]} / ${match[2]} кр.; доставлено: ${match[3]}, провалено: ${match[4]}, ожидает: ${match[5]}.`;
  match = /^Net change ([\d.-]+) CR; completion (\d+)%; (\d+) failed deliveries\.$/.exec(key);
  if (match) return `Изменение баланса: ${match[1]} кр.; выполнение: ${match[2]}%; провалено доставок: ${match[3]}.`;
  match = /^(\S+) → (\S+); ([\d.]+) min; battery after ([\d.-]+)%; expected net ([\d.-]+) CR\.$/.exec(key);
  if (match) return `${match[1]} → ${match[2]}; ${match[3]} мин; батарея после доставки ${match[4]}%; ожидаемый итог ${match[5]} кр.`;
  match = /^Order is (\S+)$/.exec(key);
  if (match) return `Заказ имеет статус «${translateRussianText(match[1] ?? '')}»`;
  match = /^Rover is (\S+)$/.exec(key);
  if (match) return `Ровер имеет статус «${translateRussianText(match[1] ?? '')}»`;
  match = /^Mission is (\S+)$/.exec(key);
  if (match) return `Миссия имеет статус «${translateRussianText(match[1] ?? '')}»`;
  match = /^Route exceeds requested risk limit of (\d+)%$/.exec(key);
  if (match) return `Риск маршрута превышает заданный предел ${match[1]}%`;
  match = /^(\S+) departed with (\S+)$/.exec(key);
  if (match) return `${match[1]} отправился с заказом ${match[2]}`;
  match = /^(\S+) reached (.+)$/.exec(key);
  if (match) return `${match[1]} прибыл в точку ${match[2]}`;
  match = /^Dust and terrain added ([\d.]+) minutes$/.exec(key);
  if (match) return `Пыль и сложный рельеф добавили ${match[1]} мин`;
  match = /^([\d.]+)% battery lost in difficult terrain$/.exec(key);
  if (match) return `На сложном рельефе потеряно ${match[1]}% заряда`;
  match = /^(\S+) was damaged on edge (\S+)$/.exec(key);
  if (match) return `Заказ ${match[1]} повреждён на участке ${match[2]}`;
  match = /^(\S+) failed: (.+)$/.exec(key);
  if (match) return `Заказ ${match[1]} не доставлен: ${translateRussianText(match[2] ?? '')}`;
  match = /^(\S+) delivered by (\S+)$/.exec(key);
  if (match) return `Заказ ${match[1]} доставлен ровером ${match[2]}`;
  match = /^Balance is now ([\d.-]+) credits$/.exec(key);
  if (match) return `Текущий баланс: ${match[1]} кр.`;
  match = /^(\S+) charged from ([\d.]+)% to ([\d.]+)%$/.exec(key);
  if (match) return `${match[1]} заряжен с ${match[2]}% до ${match[3]}%`;
  match = /^(\S+) returned to service after ([\d.]+) minutes$/.exec(key);
  if (match) return `${match[1]} вернулся в строй через ${match[2]} мин`;
  match = /^Impossible order\(s\): (.+)$/.exec(key);
  if (match) return `Невыполнимые заказы: ${match[1]}`;
  match = /^Target is below gross upper bound of ([\d.-]+) credits$/.exec(key);
  if (match) return `Цель ниже предельной выручки ${match[1]} кр.`;
  match = /^Target ([\d.-]+) exceeds gross upper bound ([\d.-]+)$/.exec(key);
  if (match) return `Цель ${match[1]} превышает предельную выручку ${match[2]}`;
  match = /^(\S+) is feasible with (.+); (\d+) rover\(s\) are blocked\.$/.exec(key);
  if (match) return `Заказ ${match[1]} выполним роверами ${match[2]}; несовместимых роверов: ${match[3]}.`;
  match = /^(\S+) is impossible with every available rover: (.+)$/.exec(key);
  if (match) {
    const reasons = (match[2] ?? '').split('; ').map((item) => {
      const separator = item.indexOf(': ');
      return separator < 0 ? translateRussianText(item) : `${item.slice(0, separator)}: ${translateRussianText(item.slice(separator + 2))}`;
    }).join('; ');
    return `Заказ ${match[1]} невозможно доставить ни одним доступным ровером: ${reasons}`;
  }
  match = /^(.+) has the highest simulated success rate: (\d+)% across (\d+) runs\.$/.exec(key);
  if (match) return `Вариант «${translateRussianText(match[1] ?? '')}» имеет наибольшую расчётную вероятность успеха: ${match[2]}% по результатам ${match[3]} прогонов.`;
  match = /^(Order|Rover|Mission|Scenario) not found: (.+)$/.exec(key);
  if (match) {
    const entities: Record<string, string> = { Order: 'Заказ', Rover: 'Ровер', Mission: 'Миссия', Scenario: 'Сценарий' };
    return `${entities[match[1] ?? ''] ?? 'Объект'} не найден: ${match[2]}`;
  }
  match = /^Request failed: (\d+)$/.exec(key);
  if (match) return `Ошибка запроса: ${match[1]}`;
  if (key === 'No feasible assignment satisfies the requested constraints.') return 'Нет допустимого назначения, удовлетворяющего заданным ограничениям.';
  if (key === 'No comparison produced.') return 'Сравнение не дало результата.';
  return key;
}

export function I18nProvider({ children, initialLocale = 'ru' }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${STORAGE_KEY}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'ru' ? 'Лунный курьер: кризис' : 'Moon Courier Crisis';
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key) => locale === 'ru' ? translateRussianText(key) : key,
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('I18nProvider is missing');
  return context;
}
