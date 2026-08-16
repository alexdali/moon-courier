import { AnalyticsWorkspace } from '@/components/analytics/analytics-workspace';
import { PageHeading } from '@/components/layout/page-heading';
import { SiteHeader } from '@/components/layout/site-header';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const query = await searchParams;
  const initialTab = query.tab === 'developer' ? 'developer' : 'analytics';
  const container = ensureDemoInitialized();
  const data = container.useCases.analytics.execute(undefined, 80);
  const history = container.useCases.aiHistory.execute();
  return (
    <>
      <SiteHeader subtitle="Mission Debrief" />
      <main className="page-shell">
        <PageHeading
          eyebrow="Operational analytics"
          title="Evidence before explanation."
          description="All metrics and counterfactuals are calculated by the deterministic engine. AI may explain these numbers, but it never creates them."
        />
        <AnalyticsWorkspace
          key={initialTab}
          analytics={data}
          history={history}
          initialTab={initialTab}
        />
      </main>
    </>
  );
}
