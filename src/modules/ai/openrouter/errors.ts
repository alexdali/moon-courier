export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export class AiOutputError extends Error {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AiOutputError';
  }
}

export class AiBudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiBudgetError';
  }
}

export interface AiAttemptTelemetry {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  latencyMs: number;
  response?: unknown;
}

/** Carries billable telemetry when an API call succeeded but application validation rejected its output. */
export class AiAttemptError extends Error {
  constructor(
    message: string,
    readonly telemetry: AiAttemptTelemetry,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiAttemptError';
  }
}
