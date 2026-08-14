import type { AiService } from '@/application/ports/ai-service';

export class AskMissionControlUseCase {
  constructor(private readonly ai: AiService) {}
  execute(input: { missionId: string; message: string; selectedOrderId?: string; selectedRoverId?: string }) {
    return this.ai.answerMissionQuestion(input);
  }
}
