'use client';

import { useI18n } from '@/i18n/i18n-provider';

export default function Loading() {
  const { t } = useI18n();
  return <div className="full-page-message"><span className="loader"/><h1>{t('Loading Mission Control…')}</h1></div>;
}
