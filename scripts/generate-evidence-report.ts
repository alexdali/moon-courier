import { resolve } from 'node:path';
import { createAppContainer } from '@/infrastructure/composition/app-container';
import { createDemoScenario } from '@/fixtures/demo-scenario';
import { validateScenario } from '@/domain/scenarios/scenario-validator';
import { analyzeScenarioBalance } from '@/domain/scenarios/balance-analyzer';
import { writeJson, writeText } from './lib/files';
import { reportsDir } from './lib/project-paths';

const container = createAppContainer();
const missionId = container.useCases.initializeDemo.execute();
const dashboard = container.useCases.dashboard.execute(missionId);
const scenario = createDemoScenario();
const validation = validateScenario(scenario);
const balance = analyzeScenarioBalance(scenario, 500);
const foreignKeyViolations = container.db.pragma('foreign_key_check') as unknown[];
const evidence = {
  generatedAt: new Date().toISOString(),
  modelRouting: {
    primary: container.env.AI_PRIMARY_MODEL,
    fallback: container.env.AI_FALLBACK_MODEL,
    aiConfigured: Boolean(container.env.OPENROUTER_API_KEY),
    localModelImplemented: false,
  },
  database: { path: container.env.DATABASE_PATH, counts: container.metrics.counts(), foreignKeyViolations },
  demo: {
    missionId,
    scenarioId: dashboard.scenario.id,
    orders: dashboard.orders.length,
    rovers: dashboard.rovers.length,
    impossibleOrders: validation.impossibleOrderCodes,
    feasiblePairs: validation.feasiblePairCount,
  },
  validation,
  balance,
  recentAiRuns: container.repositories.aiAudit.listRecent(20),
};
writeJson(resolve(reportsDir, 'demo-evidence.json'), evidence);
writeText(resolve(reportsDir, 'demo-evidence.md'), [
  '# Moon Courier Crisis — demo evidence',
  '',
  `Generated: ${evidence.generatedAt}`,
  '',
  '## Acceptance evidence',
  '',
  `- Scenario validation: **${validation.valid ? 'PASS' : 'FAIL'}**`,
  `- Feasible rover/order assignments: **${validation.feasiblePairCount}**`,
  `- Intentionally impossible orders: **${validation.impossibleOrderCodes.join(', ') || 'none'}**`,
  `- Seeded balance simulation: **${Math.round(balance.successRate * 100)}% success rate** over 500 runs`,
  `- Database foreign-key violations: **${evidence.database.foreignKeyViolations.length}**`,
  '',
  '## AI routing',
  '',
  `- Primary: \`${evidence.modelRouting.primary}\``,
  `- Fallback: \`${evidence.modelRouting.fallback}\``,
  `- API configured in this run: **${evidence.modelRouting.aiConfigured}**`,
  '- Local model: **not implemented**; architecture note only.',
  '',
  '## Database counts',
  '',
  '```json',
  JSON.stringify(evidence.database.counts, null, 2),
  '```',
  '',
  '## Validation checks',
  '',
  ...validation.checks.map((check) => `- ${check.status === 'pass' ? 'PASS' : check.status.toUpperCase()}: **${check.code}** — ${check.message}`),
  '',
].join('\n'));
console.log('Generated reports/demo-evidence.md and reports/demo-evidence.json');
container.db.close();
