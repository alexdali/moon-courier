'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'ru' | 'en';

const STORAGE_KEY = 'moon-courier-locale';

const ru: Record<string, string> = {
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
  'Mission Control AI': 'AI центра управления',
  'deterministic mode': 'детерминированный режим',
  'Recommend': 'Рекомендовать',
  'Explain': 'Объяснить',
  'Compare': 'Сравнить',
  'Offline rules': 'Офлайн-правила',
  'Luna fallback': 'резерв Luna',
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
  'Mission Debrief': 'Разбор миссии',
  'Operational analytics': 'Операционная аналитика',
  'Evidence before explanation.': 'Сначала данные, потом объяснение.',
  'All metrics and counterfactuals are calculated by the deterministic engine. AI may explain these numbers, but it never creates them.': 'Все метрики и альтернативные сценарии рассчитывает детерминированный движок. AI может объяснять числа, но не создаёт их.',
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
  'Intentionally impossible order': 'Заведомо невозможный заказ',
  'mission success': 'успех миссии',
  'Median': 'Медиана',
  'Scenario Architect subtitle': 'Конструктор сценариев',
  'AI world generation': 'AI-генерация мира',
  'Generate worlds. Validate every rule.': 'Создавайте миры. Проверяйте каждое правило.',
  'DeepSeek produces a strict scenario blueprint. Code checks the graph, identifiers, feasible assignments, the impossible order and economic survivability. Luna is called only when the primary attempt fails.': 'DeepSeek создаёт строгую схему сценария. Код проверяет граф, идентификаторы, допустимые назначения, невозможный заказ и экономическую устойчивость. Luna вызывается только при сбое основной модели.',
  'Scenario brief': 'Описание сценария',
  'AI structured output': 'структурированный ответ AI',
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
  'Generated by': 'Источник',
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
  'The operations screen proves what is persisted and which model actually handled each AI request.': 'Экран системы показывает, что сохранено и какая модель реально обработала каждый AI-запрос.',
  'AI routing': 'Маршрутизация AI',
  'Scenarios': 'Сценарии',
  'Missions': 'Миссии',
  'Deliveries': 'Доставки',
  'Ai Runs': 'AI-запуски',
  'online': 'онлайн',
  'offline': 'офлайн',
  'Primary': 'Основная',
  'Fallback': 'Резервная',
  'Cost today': 'Стоимость сегодня',
  'Fallback is explicit in application code, so every failed DeepSeek attempt and every Luna recovery can be audited separately.': 'Резервный маршрут задан явно в коде: каждый сбой DeepSeek и восстановление через Luna можно проверить отдельно.',
  'Runtime': 'Среда выполнения',
  'Environment': 'Окружение',
  'Database': 'База данных',
  'Recent AI runs': 'Последние AI-запуски',
  'audit records': 'записей аудита',
  'Request': 'Запрос',
  'Model': 'Модель',
  'Role': 'Роль',
  'Status': 'Статус',
  'Tokens': 'Токены',
  'Latency': 'Задержка',
  'Cost': 'Стоимость',
  'No AI calls have been made. Add an OpenRouter key and use Mission Control or Scenario Architect.': 'AI-вызовов ещё не было. Добавьте ключ OpenRouter и используйте центр управления или конструктор сценариев.',
  'Architecture': 'Архитектура',
  'Design principle': 'Принцип проектирования',
  'LLM outside the domain core.': 'LLM вне доменного ядра.',
  'Battery, payload, route, risk, economy and delivery outcome remain deterministic and testable.': 'Батарея, груз, маршрут, риск, экономика и результат доставки остаются детерминированными и тестируемыми.',
  'Runtime flow': 'Поток выполнения',
  'Offline position': 'Офлайн-режим',
  'Prototype boundary': 'Границы прототипа',
  'The current implementation deliberately does not ship a local LLM. The domain engine and deterministic assistant still work without an API key. A future Ollama-compatible adapter can implement the same transport contract without changing the game rules.': 'Текущая версия намеренно не включает локальную LLM. Доменный движок и детерминированный помощник работают без API-ключа. В будущем совместимый с Ollama адаптер сможет реализовать тот же транспортный контракт без изменения правил игры.',
  'This is a strong test-task vertical slice, not a production fleet-management platform. It demonstrates state modeling, constraints, persistence, seeded simulation, AI tool calling, fallback and evidence.': 'Это полноценный вертикальный срез тестового задания, а не промышленная платформа управления флотом. Он демонстрирует моделирование состояния, ограничения, хранение данных, воспроизводимую симуляцию, AI-инструменты, резервный маршрут и проверяемые доказательства.',
  'Generated scenario map': 'Карта сгенерированного сценария',
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

function translateRussian(key: string): string {
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
  if (match) return `Баланс ${match[1]} / ${match[2]} CR; доставлено: ${match[3]}, провалено: ${match[4]}, ожидает: ${match[5]}.`;
  match = /^Net change ([\d.-]+) CR; completion (\d+)%; (\d+) failed deliveries\.$/.exec(key);
  if (match) return `Изменение баланса: ${match[1]} CR; выполнение: ${match[2]}%; провалено доставок: ${match[3]}.`;
  match = /^(\S+) → (\S+); ([\d.]+) min; battery after ([\d.-]+)%; expected net ([\d.-]+) CR\.$/.exec(key);
  if (match) return `${match[1]} → ${match[2]}; ${match[3]} мин; батарея после доставки ${match[4]}%; ожидаемый итог ${match[5]} CR.`;
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
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key) => locale === 'ru' ? translateRussian(key) : key,
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('I18nProvider is missing');
  return context;
}
