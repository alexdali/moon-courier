import type { AiAuditRepository } from '@/application/ports/ai-audit-repository';
import type { AppEnv } from '@/config/env';
import { AiBudgetError } from '@/modules/ai/openrouter/errors';

export class AiBudgetGuard {
  constructor(private readonly audit: AiAuditRepository, private readonly env: AppEnv) {}
  assertAvailable(now = new Date()): void {
    const midnight = new Date(now);
    midnight.setUTCHours(0, 0, 0, 0);
    const spent = this.audit.sumCostSince(midnight.toISOString());
    if (spent >= this.env.AI_DAILY_BUDGET_USD) {
      throw new AiBudgetError(`Daily AI budget exhausted: $${spent.toFixed(4)} / $${this.env.AI_DAILY_BUDGET_USD.toFixed(2)}`);
    }
  }
}
