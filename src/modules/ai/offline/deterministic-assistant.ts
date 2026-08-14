import type { AiAssistantResponseDto } from '@/application/dto/ai-assistant';
import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { loadMissionState } from '@/application/services/mission-state-reader';
import { MissionToolRegistry } from '@/modules/ai/tools/tool-registry';

export class DeterministicAssistant {
  private readonly tools: MissionToolRegistry;
  constructor(private readonly repositories: RepositoryBundle) { this.tools = new MissionToolRegistry(repositories); }

  async answer(input: {
    missionId: string;
    message: string;
    selectedOrderId?: string;
    selectedRoverId?: string;
  }): Promise<AiAssistantResponseDto> {
    const state = loadMissionState(this.repositories, input.missionId);
    const text = input.message.toLowerCase();
    let name = 'get_mission_summary';
    let args: unknown = {};
    if (/why|block|impossible|cannot|почему|невозмож|нельзя/.test(text)) {
      const orderId = input.selectedOrderId ?? state.orders.find((order) => text.includes(order.code.toLowerCase()))?.id ?? state.orders.find((order) => order.impossibleReason)?.id;
      if (orderId) {
        name = 'explain_dispatch_blockers';
        args = { orderId, ...(input.selectedRoverId ? { roverId: input.selectedRoverId } : {}) };
      }
    } else if (/recommend|best|safe|assign|рекоменд|лучший|безопас/.test(text)) {
      name = 'recommend_dispatch';
      args = { minimumBatteryReservePercent: 15, riskTolerance: 'medium', prioritizeUrgency: ['critical', 'high', 'normal', 'low'], objective: 'balanced', excludedRoverCodes: [] };
    } else if (/what if|compare|extra|additional|сравн|что если|ещ[её] один/.test(text)) {
      name = 'compare_fleet_options';
      args = { options: ['baseline', 'extra-heavy-rover', 'faster-charging'], iterations: 100 };
    } else if (/analytics|profit|failure|utilization|аналит|прибыл|провал|загруз/.test(text)) {
      name = 'get_delivery_analytics';
      args = {};
    }
    const result = await this.tools.execute(name, args, input.missionId);
    return {
      answer: result.summary,
      mode: 'deterministic',
      model: null,
      fallbackUsed: false,
      toolCalls: [{ name, arguments: args, resultSummary: result.summary }],
      ...(result.suggestedSelection ? { suggestedSelection: result.suggestedSelection } : {}),
    };
  }
}
