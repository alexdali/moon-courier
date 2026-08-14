import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import type { AiTool, AiToolResult } from '@/modules/ai/tools/types';
import { RecommendDispatchTool } from '@/modules/ai/tools/recommend-dispatch-tool';
import { ExplainDispatchBlockersTool } from '@/modules/ai/tools/explain-dispatch-blockers-tool';
import { GetMissionSummaryTool } from '@/modules/ai/tools/get-mission-summary-tool';
import { CompareFleetOptionsTool } from '@/modules/ai/tools/compare-fleet-options-tool';
import { GetDeliveryAnalyticsTool } from '@/modules/ai/tools/get-delivery-analytics-tool';

export class MissionToolRegistry {
  private readonly tools: Map<string, AiTool>;
  constructor(repositories: RepositoryBundle) {
    const list: AiTool[] = [
      new RecommendDispatchTool(repositories),
      new ExplainDispatchBlockersTool(repositories),
      new GetMissionSummaryTool(repositories),
      new CompareFleetOptionsTool(repositories),
      new GetDeliveryAnalyticsTool(repositories),
    ];
    this.tools = new Map(list.map((tool) => [tool.definition.function.name, tool]));
  }
  definitions() { return [...this.tools.values()].map((tool) => tool.definition); }
  async execute(name: string, args: unknown, missionId: string): Promise<AiToolResult> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown AI tool: ${name}`);
    return tool.execute(args, { missionId });
  }
}
