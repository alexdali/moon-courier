import type { AiAssistantResponseDto } from '@/application/dto/ai-assistant';
import type { ScenarioGenerationDto } from '@/application/dto/scenario-generation';

export interface AiService {
  answerMissionQuestion(input: {
    missionId: string;
    message: string;
    selectedOrderId?: string;
    selectedRoverId?: string;
  }): Promise<AiAssistantResponseDto>;
  generateScenario(input: {
    prompt: string;
    seed?: number;
    difficulty?: 'easy' | 'normal' | 'hard' | 'crisis';
    durationDays?: number;
  }): Promise<ScenarioGenerationDto>;
}
