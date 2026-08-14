import { createAppContainer } from '@/infrastructure/composition/app-container';
import { assistantEvaluationCases } from '@/fixtures/evaluation-cases';
import { intOption } from './lib/cli';
import { writeJson, writeText } from './lib/files';
import { reportsDir } from './lib/project-paths';
import { resolve } from 'node:path';

const limit = intOption('--limit', assistantEvaluationCases.length, { min: 1, max: assistantEvaluationCases.length });
const container = createAppContainer();
if (!container.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required for paid evaluation');
const missionId = container.useCases.initializeDemo.execute();
const results = [];
for (const testCase of assistantEvaluationCases.slice(0, limit)) {
  const started = performance.now();
  const response = await container.useCases.askMissionControl.execute({ missionId, message: testCase.prompt });
  results.push({
    id: testCase.id,
    prompt: testCase.prompt,
    expectedTool: testCase.expectedTool,
    actualTools: response.toolCalls.map((item) => item.name),
    toolMatched: testCase.expectedTool === null || response.toolCalls.some((item) => item.name === testCase.expectedTool),
    model: response.model,
    fallbackUsed: response.fallbackUsed,
    mode: response.mode,
    latencyMs: Math.round(performance.now() - started),
    answer: response.answer,
  });
}
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const jsonPath = resolve(reportsDir, `ai-evaluation-${timestamp}.json`);
const mdPath = resolve(reportsDir, `ai-evaluation-${timestamp}.md`);
writeJson(jsonPath, results);
writeText(mdPath, [
  '# AI evaluation',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Tool-match rate: ${Math.round(results.filter((item) => item.toolMatched).length / Math.max(1, results.length) * 100)}%`,
  '',
  ...results.flatMap((item) => [
    `## ${item.id}`,
    '',
    `- Model: \`${item.model ?? 'offline'}\``,
    `- Fallback: ${item.fallbackUsed}`,
    `- Expected tool: \`${item.expectedTool ?? 'none'}\``,
    `- Actual tools: ${item.actualTools.map((name) => `\`${name}\``).join(', ') || 'none'}`,
    `- Match: ${item.toolMatched ? 'PASS' : 'FAIL'}`,
    '',
    item.answer,
    '',
  ]),
].join('\n'));
console.log(`Saved ${jsonPath}\nSaved ${mdPath}`);
container.db.close();
