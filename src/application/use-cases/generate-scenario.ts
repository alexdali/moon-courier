import type { AiService } from '@/application/ports/ai-service';

export class GenerateScenarioUseCase {
  constructor(private readonly ai: AiService) {}
  execute(input: { prompt: string; seed?: number; difficulty?: 'easy' | 'normal' | 'hard' | 'crisis'; durationDays?: number }) {
    return this.ai.generateScenario(input);
  }
}
