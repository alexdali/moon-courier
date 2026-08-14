import type { InitializeDemoUseCase } from '@/application/use-cases/initialize-demo';

export class ResetDemoUseCase {
  constructor(private readonly initializeDemo: InitializeDemoUseCase) {}
  execute(): string { return this.initializeDemo.execute({ force: true }); }
}
