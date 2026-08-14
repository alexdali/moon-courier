import type { Metadata } from 'next';
import { PageHeading } from '@/components/layout/page-heading';
import { SiteHeader } from '@/components/layout/site-header';
import { AboutContent } from '@/components/about/about-content';

export const metadata: Metadata = { title: 'About Architecture' };

export default function AboutPage() {
  return <><SiteHeader subtitle="Architecture"/><main className="page-shell"><PageHeading eyebrow="Design principle" title="LLM outside the domain core." description="Battery, payload, route, risk, economy and delivery outcome remain deterministic and testable."/><AboutContent/></main></>;
}
