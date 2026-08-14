'use client';

import { useI18n } from '@/i18n/i18n-provider';

export function AboutContent() {
  const { locale, t } = useI18n();
  const flow = locale === 'ru'
    ? `Запрос человека\n  ↓\nDeepSeek Mission Control\n  ↓ вызов инструмента\nДетерминированный планировщик / симулятор\n  ↓ проверенные данные\nОбъяснение DeepSeek\n  ↓ сбой\nРезерв Luna`
    : `Human intent\n  ↓\nDeepSeek Mission Control\n  ↓ tool request\nDeterministic planner / simulator\n  ↓ verified data\nDeepSeek explanation\n  ↓ failure\nLuna fallback`;
  return <div className="about-grid">
    <section className="panel"><h2>{t('Runtime flow')}</h2><pre>{flow}</pre></section>
    <section className="panel"><h2>{t('Offline position')}</h2><p>{t('The current implementation deliberately does not ship a local LLM. The domain engine and deterministic assistant still work without an API key. A future Ollama-compatible adapter can implement the same transport contract without changing the game rules.')}</p></section>
    <section className="panel"><h2>{t('Prototype boundary')}</h2><p>{t('This is a strong test-task vertical slice, not a production fleet-management platform. It demonstrates state modeling, constraints, persistence, seeded simulation, AI tool calling, fallback and evidence.')}</p></section>
  </div>;
}
