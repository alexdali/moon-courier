'use client';

import { useI18n } from '@/i18n/i18n-provider';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return <div className="full-page-message"><h1>{t('Mission Control failed to initialize')}</h1><p>{t(error.message)}</p><button className="primary-action" onClick={reset}>{t('Retry')}</button></div>;
}
