'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/i18n-provider';

export default function NotFound() {
  const { t } = useI18n();
  return <div className="full-page-message"><h1>{t('Sector not found')}</h1><p>{t('The requested Mission Control route does not exist.')}</p><Link className="primary-action" href="/">{t('Return to mission')}</Link></div>;
}
