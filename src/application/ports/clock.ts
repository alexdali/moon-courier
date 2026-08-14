/** Returns an ISO-8601 UTC timestamp. Keeping time as an injected port makes simulations and tests reproducible. */
export interface Clock {
  now(): string;
}
