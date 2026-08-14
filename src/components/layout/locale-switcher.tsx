'use client';

import { useI18n } from '@/i18n/i18n-provider';

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return <div className="locale-switcher" role="group" aria-label={t('Language')}>
    <button type="button" className={locale === 'ru' ? 'is-active' : ''} onClick={() => setLocale('ru')} aria-pressed={locale === 'ru'} title={t('Russian')}>RU</button>
    <button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => setLocale('en')} aria-pressed={locale === 'en'} title={t('English')}>EN</button>
  </div>;
}
