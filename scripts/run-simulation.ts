import { createDemoScenario } from '@/fixtures/demo-scenario';
import { safeBalancedPolicy } from '@/domain/planning/policies';
import { runMonteCarlo } from '@/domain/simulation/mission-simulator';
import { analyzeScenarioBalance } from '@/domain/scenarios/balance-analyzer';
import { intOption, printJson } from './lib/cli';

const iterations = intOption('--iterations', 500, { min: 1, max: 20_000 });
const scenario = createDemoScenario();
const result = runMonteCarlo({ scenario, policy: safeBalancedPolicy, iterations, seed: scenario.seed });
printJson({ scenario: scenario.name, policy: safeBalancedPolicy, balance: analyzeScenarioBalance(scenario, Math.min(iterations, 1_000)), summary: result.summary });
