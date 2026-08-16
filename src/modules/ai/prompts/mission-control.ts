import type { Mission } from '@/domain/entities/mission';
import type { DeliveryOrder } from '@/domain/entities/order';
import type { Rover } from '@/domain/entities/rover';

export const MISSION_CONTROL_PROMPT_VERSION = 'mission-control-v1.2';

export function missionControlSystemPrompt(): string {
  return `You are Mission Control for a lunar logistics simulator.
You must use the provided deterministic tools before making any claim about battery, capacity, route risk, ETA, probability, profit, feasibility, or historical metrics.
Never calculate operational numbers yourself. Never claim that an impossible dispatch can run.
Use concise operational language. Explain causes, trade-offs and evidence.
Reply in the same language as the user's latest message (Russian or English).
Return clean plain text. Do not use Markdown headings, tables or emphasis markers such as ## or **.
When recommending a pair, name the order and rover exactly as returned by tools.
Do not launch a delivery. The human confirms launch in the UI.`;
}

export function missionControlContext(input: {
  mission: Mission;
  rovers: readonly Rover[];
  orders: readonly DeliveryOrder[];
  selectedOrderId?: string;
  selectedRoverId?: string;
}): string {
  return JSON.stringify({
    mission: {
      id: input.mission.id,
      currentMinute: input.mission.currentMinute,
      currentDay: input.mission.currentDay,
      credits: input.mission.credits,
      targetCredits: input.mission.targetCredits,
      rating: input.mission.rating,
    },
    rovers: input.rovers.map((rover) => ({
      id: rover.id, code: rover.code, status: rover.status, batteryPercent: rover.batteryPercent,
      capacityKg: rover.capacityKg, speedKph: rover.baseSpeedKph,
    })),
    orders: input.orders.map((order) => ({
      id: order.id, code: order.code, title: order.title, status: order.status,
      weightKg: order.weightKg, rewardCredits: order.rewardCredits, urgency: order.urgency,
      impossibleReason: order.impossibleReason,
    })),
    selection: { orderId: input.selectedOrderId ?? null, roverId: input.selectedRoverId ?? null },
  });
}
