export interface AssistantEvaluationCase {
  id: string;
  prompt: string;
  expectedTool: string | null;
  expectedText?: readonly string[];
}

export interface ScenarioEvaluationCase {
  id: string;
  prompt: string;
  expectedDifficulty?: 'easy' | 'normal' | 'hard' | 'crisis';
  expectedDurationDays?: number;
}

export const assistantEvaluationCases: readonly AssistantEvaluationCase[] = [
  {
    id: 'capacity-blocker',
    prompt: 'Why can no rover deliver HAB-021?',
    expectedTool: 'explain_dispatch_blockers',
    expectedText: ['capacity', '148'],
  },
  {
    id: 'safe-critical-recommendation',
    prompt: 'Recommend the safest critical delivery with at least 15% battery reserve.',
    expectedTool: 'recommend_dispatch',
  },
  {
    id: 'mission-summary',
    prompt: 'Summarize the current mission state and the biggest bottleneck.',
    expectedTool: 'get_mission_summary',
  },
  {
    id: 'fleet-counterfactual',
    prompt: 'What changes if we add one more heavy rover?',
    expectedTool: 'compare_fleet_options',
  },
  {
    id: 'delivery-failures',
    prompt: 'Which failure reasons are costing us the most?',
    expectedTool: 'get_delivery_analytics',
  },
  {
    id: 'greeting',
    prompt: 'Hello, Mission Control.',
    expectedTool: null,
  },
] as const;

export const scenarioEvaluationCases: readonly ScenarioEvaluationCase[] = [
  {
    id: 'medical-surge',
    prompt: 'Generate a balanced five-day medical demand surge with limited heavy transport and one impossible order.',
    expectedDifficulty: 'hard',
    expectedDurationDays: 5,
  },
  {
    id: 'safe-training',
    prompt: 'Generate an easy three-day training scenario with low risk and one deliberately oversized order.',
    expectedDifficulty: 'easy',
    expectedDurationDays: 3,
  },
] as const;

export const aiEvaluationCases = [
  ...assistantEvaluationCases.map((item) => ({ ...item, requestType: 'assistant' as const })),
  ...scenarioEvaluationCases.map((item) => ({ ...item, requestType: 'scenario' as const })),
] as const;
