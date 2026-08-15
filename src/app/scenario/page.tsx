import { PageHeading } from '@/components/layout/page-heading';
import { SiteHeader } from '@/components/layout/site-header';
import { ScenarioArchitect } from '@/components/scenario/scenario-architect';
import { ensureDemoInitialized } from '@/infrastructure/composition/app-container';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function ScenarioPage() {
  const scenarios = ensureDemoInitialized().useCases.listScenarios.execute();
  return <><SiteHeader subtitle="Scenario Architect"/><main className="page-shell"><PageHeading eyebrow="AI world generation" title="Generate worlds. Validate every rule." description="DeepSeek produces a strict scenario blueprint. Code checks the graph, identifiers, feasible assignments, the impossible order and economic survivability. Luna is called only when the primary attempt fails."/><ScenarioArchitect initialScenarios={scenarios}/></main></>;
}
