'use client';

import Link from 'next/link';
import { Icon } from '@/components/common/icon';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { useMissionView } from '@/components/mission/mission-view-provider';
import { useI18n } from '@/i18n/i18n-provider';

export function SiteHeader({ subtitle = 'Lunar Mission Control' }: { subtitle?: string }) {
  const { t } = useI18n();
  const { theme, setTheme } = useMissionView();
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand__mark">
          <Icon name="moon" size={21} />
        </span>
        <span>
          <strong>{t('MOON COURIER')}</strong>
          <small>{t(subtitle)}</small>
        </span>
      </Link>
      <nav className="site-nav" aria-label={t('Primary navigation')}>
        <Link href="/">{t('Mission')}</Link>
        <Link href="/scenario">{t('Scenario Architect')}</Link>
        <Link href="/analytics">{t('Debrief')}</Link>
        <Link href="/ops">{t('Ops')}</Link>
      </nav>
      <div className="site-header__actions">
        <div className="theme-switcher" role="group" aria-label={t('Color theme')}>
          <button
            type="button"
            className={theme === 'light' ? 'is-active' : ''}
            aria-pressed={theme === 'light'}
            onClick={() => setTheme('light')}
          >
            {t('Light')}
          </button>
          <button
            type="button"
            className={theme === 'dark' ? 'is-active' : ''}
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme('dark')}
          >
            {t('Dark')}
          </button>
        </div>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
