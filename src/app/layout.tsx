import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import '@/app/globals.css';
import { I18nProvider } from '@/i18n/i18n-provider';

export const metadata: Metadata = {
  title: { default: 'Moon Courier Crisis', template: '%s · Moon Courier Crisis' },
  description: 'Deterministic lunar logistics simulator with AI Mission Control.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const savedLocale = (await cookies()).get('moon-courier-locale')?.value;
  const initialLocale = savedLocale === 'en' ? 'en' : 'ru';
  return <html lang={initialLocale}><body><I18nProvider initialLocale={initialLocale}>{children}</I18nProvider></body></html>;
}
