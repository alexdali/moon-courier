import { PageHeading } from '@/components/layout/page-heading';
import { SiteHeader } from '@/components/layout/site-header';
import { OpsDashboard } from '@/components/ops/ops-dashboard';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function OpsPage() {
  const data = ensureDemoInitialized().useCases.ops.execute();
  return <><SiteHeader subtitle="Operations & Evidence"/><main className="page-shell"><PageHeading eyebrow="Audit surface" title="Data, models, tools and cost are visible." description="The operations screen proves what is persisted and which model actually handled each AI request."/><OpsDashboard data={data}/></main></>;
}
