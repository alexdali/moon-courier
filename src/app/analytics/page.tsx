import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { PageHeading } from '@/components/layout/page-heading';
import { SiteHeader } from '@/components/layout/site-header';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  const data = ensureDemoInitialized().useCases.analytics.execute(undefined, 80);
  return <><SiteHeader subtitle="Mission Debrief"/><main className="page-shell"><PageHeading eyebrow="Operational analytics" title="Evidence before explanation." description="All metrics and counterfactuals are calculated by the deterministic engine. AI may explain these numbers, but it never creates them."/><AnalyticsDashboard initial={data}/></main></>;
}
