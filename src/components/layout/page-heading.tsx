'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/i18n-provider';

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  const { t } = useI18n();
  return <div className="page-heading"><div><span className="eyebrow">{t(eyebrow)}</span><h1>{t(title)}</h1><p>{t(description)}</p></div>{actions ? <div className="page-heading__actions">{actions}</div> : null}</div>;
}
