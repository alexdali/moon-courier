import type { RepositoryBundle } from '@/application/ports/repository-bundle';
import { validateScenario } from '@/domain/scenarios/scenario-validator';

export class ListScenariosUseCase {
  constructor(private readonly repositories: RepositoryBundle) {}
  execute() {
    return this.repositories.scenarios.list().map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      difficulty: scenario.difficulty,
      durationDays: scenario.rules.durationDays,
      source: scenario.source,
      validation: validateScenario(scenario),
      counts: {
        nodes: scenario.world.nodes.length,
        rovers: scenario.roverTemplates.length,
        orders: scenario.orderTemplates.length,
      },
    }));
  }
}
